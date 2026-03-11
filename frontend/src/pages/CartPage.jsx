import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingCart, ArrowRight, Shield, Truck } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    if (cartItems.length === 0) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
                <div className="text-7xl mb-6">🛒</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
                <p className="text-gray-500 mb-8">Add some spare parts to get started</p>
                <Link to="/search" className="btn-primary text-base px-8 py-3">Browse Spare Parts</Link>
            </div>
        );
    }

    const shipping = totalPrice > 2000 ? 0 : 99;
    const gst = Math.round(totalPrice * 0.18);
    const grandTotal = totalPrice + shipping + gst;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <ShoppingCart className="w-6 h-6" /> Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
                </h1>
                <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1 font-medium">
                    <Trash2 className="w-4 h-4" /> Clear Cart
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart items */}
                <div className="lg:col-span-2 space-y-4">
                    {cartItems.map(item => (
                        <div key={item.id} className="card p-5 flex gap-4">
                            <Link to={`/product/${item.id}`}>
                                <img src={item.image} alt={item.name} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl flex-shrink-0 hover:scale-105 transition-transform" />
                            </Link>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <Link to={`/product/${item.id}`}>
                                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm hover:text-blue-600 dark:hover:text-blue-400 line-clamp-2">{item.name}</h3>
                                    </Link>
                                    <button onClick={() => removeFromCart(item.id)} className="text-gray-400 hover:text-red-500 transition-colors shrink-0 p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-center gap-2 mt-1">
                                    <span className="badge bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs">{item.brand}</span>
                                    <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">{item.warranty} warranty</span>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    {/* Quantity */}
                                    <div className="flex items-center gap-0 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold transition-colors">
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="px-3 py-2 font-semibold text-gray-900 dark:text-white text-sm min-w-[2.5rem] text-center">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 font-bold transition-colors">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                                        {item.quantity > 1 && <p className="text-xs text-gray-400">₹{item.price.toLocaleString()} each</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order summary */}
                <div className="space-y-4">
                    <div className="card p-5 space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg">Order Summary</h3>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Subtotal</span>
                                <span>₹{totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>Shipping</span>
                                {shipping === 0
                                    ? <span className="text-green-600 dark:text-green-400 font-medium">FREE</span>
                                    : <span>₹{shipping}</span>
                                }
                            </div>
                            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                <span>GST (18%)</span>
                                <span>₹{gst.toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-bold text-gray-900 dark:text-white text-lg">
                                <span>Total</span>
                                <span>₹{grandTotal.toLocaleString()}</span>
                            </div>
                        </div>

                        {shipping > 0 && (
                            <div className="text-xs text-center text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 rounded-lg px-3 py-2">
                                Add ₹{(2000 - totalPrice).toLocaleString()} more for FREE shipping!
                            </div>
                        )}

                        <button
                            onClick={() => navigate('/checkout')}
                            className="btn-accent w-full justify-center py-3.5 text-base"
                        >
                            Proceed to Checkout <ArrowRight className="w-4 h-4" />
                        </button>

                        <Link to="/search" className="btn-outline w-full justify-center text-sm">
                            Continue Shopping
                        </Link>
                    </div>

                    <div className="card p-4 space-y-2.5">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">We Offer</p>
                        {[
                            { icon: Shield, text: 'Warranty on all parts', color: 'text-green-500' },
                            { icon: Truck, text: 'Fast & secure delivery', color: 'text-blue-500' },
                        ].map(({ icon: Icon, text, color }) => (
                            <div key={text} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Icon className={`w-4 h-4 ${color}`} /> {text}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
