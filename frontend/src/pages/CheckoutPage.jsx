import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Lock, CreditCard, Smartphone, Building2, ChevronRight, Package, Loader2, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { apiCreateOrder, apiVerifyPayment, apiGetMe, apiAddAddress } from '../data/api';
import toast from 'react-hot-toast';

const STEPS = ['Address', 'Payment', 'Confirm'];

export default function CheckoutPage() {
    const { cartItems, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const [step, setStep] = useState(0);
    const [placed, setPlaced] = useState(false);
    const [address, setAddress] = useState({
        name: '', phone: '', pincode: '', street: '', city: '', state: '',
    });
    const [payment, setPayment] = useState('upi');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [orderId, setOrderId] = useState(null); // DB order ID
    
    // Address Selection State
    const { user } = useAuth();
    const [savedAddresses, setSavedAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState('new');
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [saveNewAddress, setSaveNewAddress] = useState(true);

    useEffect(() => {
        if (user) {
            setLoadingAddresses(true);
            apiGetMe().then(res => {
                const addrs = res.data.user.savedAddresses || [];
                setSavedAddresses(addrs);
                if (addrs.length > 0) {
                    const def = addrs.find(a => a.isDefault) || addrs[0];
                    setSelectedAddressId(def._id);
                    setAddress({
                        name: def.name || '', phone: def.phone || '', pincode: def.pincode || '',
                        street: def.street || '', city: def.city || '', state: def.state || ''
                    });
                }
            }).catch(err => console.error("Failed to load addresses", err))
              .finally(() => setLoadingAddresses(false));
        }
    }, [user]);

    const handleSelectAddress = (addr) => {
        if (addr === 'new') {
            setSelectedAddressId('new');
            setAddress({ name: '', phone: '', pincode: '', street: '', city: '', state: '' });
        } else {
            setSelectedAddressId(addr._id);
            setAddress({
                name: addr.name || '', phone: addr.phone || '', pincode: addr.pincode || '',
                street: addr.street || '', city: addr.city || '', state: addr.state || ''
            });
            setErrors({});
        }
    };

    const shipping = totalPrice > 2000 ? 0 : 99;
    const gst = Math.round(totalPrice * 0.18);
    const grandTotal = totalPrice + shipping + gst;

    const validateAddress = () => {
        const e = {};
        if (!address.name) e.name = 'Name is required';
        if (!address.phone || !/^[6-9]\d{9}$/.test(address.phone)) e.phone = 'Valid 10-digit phone required';
        if (!address.pincode || !/^\d{6}$/.test(address.pincode)) e.pincode = 'Valid 6-digit pincode required';
        if (!address.street) e.street = 'Street address is required';
        if (!address.city) e.city = 'City is required';
        if (!address.state) e.state = 'State is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const processRazorpay = async (orderData) => {
        const res = await loadRazorpayScript();
        if (!res) {
            toast.error('Razorpay SDK failed to load. Are you online?');
            return;
        }

        const options = {
            key: orderData.keyId,
            amount: orderData.amount,
            currency: orderData.currency,
            name: 'PartsBazaar',
            description: 'Order Payment',
            order_id: orderData.razorpayOrderId,
            handler: async function (response) {
                try {
                    const tid = toast.loading('Verifying payment...');
                    await apiVerifyPayment({
                        orderId: orderData.orderId,
                        razorpayOrderId: response.razorpay_order_id,
                        razorpayPaymentId: response.razorpay_payment_id,
                        razorpaySignature: response.razorpay_signature,
                    });
                    toast.success('Payment successful!', { id: tid });
                    setOrderId(`ORD-${orderData.orderId.slice(-6).toUpperCase()}`);
                    clearCart();
                    setPlaced(true);
                } catch (error) {
                    toast.error('Payment verification failed');
                    console.error(error);
                }
            },
            prefill: {
                name: address.name,
                contact: address.phone,
            },
            theme: { color: '#2563eb' }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();

        paymentObject.on('payment.failed', function () {
            toast.error('Payment failed. Please try again.');
        });
    };

    const handleNext = async () => {
        if (step === 0) {
            if (!validateAddress()) return;
            if (user && selectedAddressId === 'new' && saveNewAddress) {
                try {
                    const { data } = await apiAddAddress({ ...address, isDefault: savedAddresses.length === 0 });
                    setSavedAddresses(data.addresses);
                    const newAddr = data.addresses[data.addresses.length - 1];
                    setSelectedAddressId(newAddr._id);
                } catch (err) {
                    toast.error("Could not save address to profile.");
                }
            }
            setStep(1);
            return;
        }

        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
            return;
        }

        // Place order
        setLoading(true);
        const tid = toast.loading('Processing order...');
        try {
            const payload = {
                items: cartItems.map(i => ({ 
                    product: i._id || i.id, 
                    name: i.name, 
                    image: i.image, 
                    price: i.price, 
                    quantity: i.quantity 
                })),
                shippingAddress: address,
                subtotal: totalPrice,
                shipping,
                gst,
                total: grandTotal,
                paymentMethod: payment === 'cod' ? 'cod' : 'razorpay'
            };

            const { data } = await apiCreateOrder(payload);

            toast.dismiss(tid);

            if (payment === 'cod') {
                setOrderId(`ORD-${data.orderId.slice(-6).toUpperCase()}`);
                clearCart();
                setPlaced(true);
            } else {
                await processRazorpay(data);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create order', { id: tid });
            console.error(error);
        }
        setLoading(false);
    };

    if (placed) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <div className="card p-10 space-y-5">
                    <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Order Placed! 🎉</h2>
                    <p className="text-gray-500 text-sm">Your order <strong className="text-gray-900 dark:text-white">#{orderId}</strong> has been placed successfully.</p>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-2 text-left">
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Total Paid</span>
                            <span className="font-bold text-gray-900 dark:text-white">₹{grandTotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 dark:text-gray-400">
                            <span>Estimated Delivery</span>
                            <span className="font-semibold text-blue-600 dark:text-blue-400">2–4 Business Days</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-4">
                        <Link to="/dashboard" className="btn-primary justify-center py-3">Track Order</Link>
                        <Link to="/" className="btn-outline justify-center">Continue Shopping</Link>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="max-w-lg mx-auto px-4 py-20 text-center">
                <p className="text-5xl mb-4">🛒</p>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Nothing to checkout</h2>
                <Link to="/search" className="btn-primary">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Secure Checkout</h1>

            {/* Progress Steps */}
            <div className="flex items-center mb-10">
                {STEPS.map((s, i) => (
                    <div key={s} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                }`}>
                                {i < step ? '✓' : i + 1}
                            </div>
                            <span className={`text-xs mt-1.5 font-medium ${i === step ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{s}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-3 transition-all ${i < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />
                        )}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {/* Step 0: Address */}
                    {step === 0 && (
                        <div className="card p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2"><Package className="w-5 h-5 text-blue-600" /> Delivery Address</h2>
                            
                            {user && savedAddresses.length > 0 && (
                                <div className="space-y-3 mb-6">
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Select a Saved Address</label>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {savedAddresses.map(addr => (
                                            <div 
                                                key={addr._id} 
                                                onClick={() => handleSelectAddress(addr)}
                                                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddressId === addr._id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-gray-900 dark:text-white text-sm">{addr.name}</span>
                                                    {addr.isDefault && <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold">Default</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 line-clamp-2">{addr.street}, {addr.city}</p>
                                                <p className="text-xs text-gray-500 mt-1">{addr.phone}</p>
                                            </div>
                                        ))}
                                        <div 
                                            onClick={() => handleSelectAddress('new')}
                                            className={`p-4 rounded-xl border-2 cursor-pointer border-dashed flex flex-col items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-all ${selectedAddressId === 'new' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-300 dark:border-gray-700'}`}
                                        >
                                            <Plus className="w-5 h-5 mb-1" />
                                            <span className="text-sm font-semibold">Add New Address</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {(!user || savedAddresses.length === 0 || selectedAddressId === 'new') && (
                                <div className="space-y-4">
                                   {user && savedAddresses.length > 0 && <hr className="border-gray-200 dark:border-gray-700 my-4" />}
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Enter Delivery Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {[
                                            { key: 'name', label: 'Full Name', placeholder: 'Ravi Kumar', col: 2 },
                                            { key: 'phone', label: 'Phone Number', placeholder: '9876543210' },
                                            { key: 'pincode', label: 'Pincode', placeholder: '400001' },
                                            { key: 'street', label: 'Street Address', placeholder: 'Shop 12, Sadar Bazar', col: 2 },
                                            { key: 'city', label: 'City', placeholder: 'Mumbai' },
                                            { key: 'state', label: 'State', placeholder: 'Maharashtra' },
                                        ].map(f => (
                                            <div key={f.key} className={f.col === 2 ? 'sm:col-span-2' : ''}>
                                                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{f.label}</label>
                                                <input
                                                    value={address[f.key]}
                                                    onChange={e => setAddress(a => ({ ...a, [f.key]: e.target.value }))}
                                                    placeholder={f.placeholder}
                                                    className={`input-field ${errors[f.key] ? 'border-red-400 focus:ring-red-400' : ''}`}
                                                />
                                                {errors[f.key] && <p className="text-xs text-red-500 mt-1">{errors[f.key]}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    {user && (
                                        <label className="flex items-center gap-2 mt-4 cursor-pointer w-fit">
                                            <input type="checkbox" checked={saveNewAddress} onChange={e => setSaveNewAddress(e.target.checked)} className="rounded text-blue-600 w-4 h-4 cursor-pointer" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300 font-medium select-none">Save this address for future orders</span>
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 1: Payment */}
                    {step === 1 && (
                        <div className="card p-6 space-y-5">
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                                <Lock className="w-5 h-5 text-blue-600" /> Payment Method
                            </h2>
                            <div className="space-y-3">
                                {[
                                    { id: 'upi', label: 'UPI / PhonePe / GPay', icon: <Smartphone className="w-5 h-5" /> },
                                    { id: 'card', label: 'Credit / Debit Card', icon: <CreditCard className="w-5 h-5" /> },
                                    { id: 'netbanking', label: 'Net Banking', icon: <Building2 className="w-5 h-5" /> },
                                    { id: 'cod', label: 'Cash on Delivery', icon: <Package className="w-5 h-5" /> },
                                ].map(p => (
                                    <label key={p.id} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payment === p.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/40' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                        }`}>
                                        <input type="radio" name="payment" value={p.id} checked={payment === p.id} onChange={() => setPayment(p.id)} className="sr-only" />
                                        <div className={`${payment === p.id ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>{p.icon}</div>
                                        <span className={`font-semibold text-sm ${payment === p.id ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'}`}>{p.label}</span>
                                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${payment === p.id ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'
                                            }`}>
                                            {payment === p.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                        </div>
                                    </label>
                                ))}
                            </div>

                            {payment === 'upi' && (
                                <div className="mt-2">
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">UPI ID</label>
                                    <input placeholder="yourname@upi" className="input-field" />
                                </div>
                            )}
                            {payment === 'card' && (
                                <div className="space-y-3 mt-2">
                                    <input placeholder="Card Number" className="input-field" />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="MM/YY" className="input-field" />
                                        <input placeholder="CVV" className="input-field" type="password" maxLength={3} />
                                    </div>
                                    <input placeholder="Name on Card" className="input-field" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Confirm */}
                    {step === 2 && (
                        <div className="card p-6 space-y-4">
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg">Confirm Your Order</h2>
                            <div className="space-y-3">
                                {cartItems.map(item => (
                                    <div key={item._id || item.id} className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
                                        <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-xl" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-bold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-sm space-y-1.5">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Delivery to</span><span className="font-medium text-gray-900 dark:text-white">{address.city}, {address.pincode}</span></div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Payment</span><span className="font-medium text-gray-900 dark:text-white capitalize">{payment}</span></div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                                <Lock className="w-3.5 h-3.5" /> Your payment is 100% secure and encrypted
                            </div>
                        </div>
                    )}

                    {/* Nav buttons */}
                    <div className="flex items-center justify-between mt-6">
                        {step > 0 ? (
                            <button onClick={() => setStep(s => s - 1)} className="btn-outline">← Back</button>
                        ) : (
                            <Link to="/cart" className="btn-outline">← Cart</Link>
                        )}
                        <button onClick={handleNext} disabled={loading} className="btn-accent px-8 flex items-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : step < STEPS.length - 1 ? <>Next <ChevronRight className="w-4 h-4" /></> : <><CheckCircle className="w-4 h-4" /> Place Order</>}
                        </button>
                    </div>
                </div>

                {/* Order summary sidebar */}
                <div>
                    <div className="card p-5 space-y-4 sticky top-24">
                        <h3 className="font-bold text-gray-900 dark:text-white">Order Summary</h3>
                        <div className="space-y-2 text-sm">
                            {cartItems.map(item => (
                                <div key={item._id || item.id} className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span className="line-clamp-1 max-w-[160px]">{item.name} ×{item.quantity}</span>
                                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                                </div>
                            ))}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Shipping</span>
                                {shipping === 0 ? <span className="text-green-500 font-medium">FREE</span> : <span>₹{shipping}</span>}
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>GST (18%)</span>
                                <span>₹{gst.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                                <span>Total</span>
                                <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
