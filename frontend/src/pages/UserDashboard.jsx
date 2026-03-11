import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Package, Heart, MapPin, User, ChevronRight,
    CheckCircle, Truck, Box, Clock
} from 'lucide-react';
import { orders } from '../data/mockData';
import { useWishlist } from '../context/WishlistContext';

const TAB_LABELS = [
    { key: 'orders', label: 'My Orders', icon: Package },
    { key: 'wishlist', label: 'Wishlist', icon: Heart },
    { key: 'addresses', label: 'Addresses', icon: MapPin },
    { key: 'profile', label: 'Profile', icon: User },
];

const STATUS_COLORS = {
    ordered: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
    packed: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
    shipped: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
    delivered: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
};

function OrderTimeline({ timeline }) {
    return (
        <div className="flex items-center mt-4 overflow-x-auto pb-2">
            {timeline.map((step, i) => (
                <div key={step.step} className="flex items-center flex-shrink-0">
                    <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${step.done ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                            }`}>
                            {step.done
                                ? <CheckCircle className="w-4 h-4 text-white" />
                                : <Clock className="w-4 h-4 text-gray-400" />
                            }
                        </div>
                        <p className={`text-xs mt-1.5 font-medium whitespace-nowrap ${step.done ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                            {step.label}
                        </p>
                        {step.date && <p className="text-xs text-gray-400 mt-0.5">{step.date}</p>}
                    </div>
                    {i < timeline.length - 1 && (
                        <div className={`w-16 h-0.5 mx-1 shrink-0 ${timeline[i + 1].done ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'
                            }`} />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function UserDashboard() {
    const [tab, setTab] = useState('orders');
    const { wishlist, removeFromWishlist } = useWishlist();
    const [profile, setProfile] = useState({
        name: 'Ravi Kumar',
        email: 'ravi@repairshop.com',
        phone: '9876543210',
        shopName: 'Ravi Mobile Repair',
        type: 'Repair Shop',
    });

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    {profile.name[0]}
                </div>
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{profile.type} · {profile.email}</p>
                </div>
            </div>

            <div className="flex gap-8 flex-col lg:flex-row">
                {/* Sidebar */}
                <aside className="lg:w-56 flex-shrink-0">
                    <div className="card p-3">
                        {TAB_LABELS.map(({ key, label, icon: Icon }) => (
                            <button
                                key={key}
                                onClick={() => setTab(key)}
                                className={`sidebar-link w-full ${tab === key ? 'active' : ''}`}
                            >
                                <Icon className="w-4.5 h-4.5" /> {label}
                                <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Orders */}
                    {tab === 'orders' && (
                        <div className="space-y-5">
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg">My Orders</h2>
                            {orders.map(order => (
                                <div key={order.id} className="card p-5">
                                    <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white">{order.id}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">Placed: {order.date}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`badge ${STATUS_COLORS[order.status]} capitalize`}>{order.status}</span>
                                            <span className="font-bold text-gray-900 dark:text-white">₹{order.total.toLocaleString()}</span>
                                        </div>
                                    </div>

                                    {/* Items */}
                                    <div className="flex gap-3 overflow-x-auto pb-2 mb-4">
                                        {order.items.map(item => (
                                            <Link key={item.id} to={`/product/${item.id}`} className="flex-shrink-0 flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1 max-w-[150px]">{item.name}</p>
                                                    <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Timeline */}
                                    <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Order Timeline</p>
                                        <OrderTimeline timeline={order.timeline} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Wishlist */}
                    {tab === 'wishlist' && (
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-5">My Wishlist ({wishlist.length})</h2>
                            {wishlist.length === 0 ? (
                                <div className="text-center py-16">
                                    <Heart className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                                    <p className="text-gray-500 mb-4">No items in your wishlist yet</p>
                                    <Link to="/search" className="btn-primary">Browse Parts</Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {wishlist.map(item => (
                                        <div key={item.id} className="card p-4 flex items-center gap-4">
                                            <Link to={`/product/${item.id}`}>
                                                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                                            </Link>
                                            <div className="flex-1 min-w-0">
                                                <Link to={`/product/${item.id}`}>
                                                    <p className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-1 hover:text-blue-600">{item.name}</p>
                                                </Link>
                                                <p className="text-xs text-gray-400 mt-0.5">{item.brand}</p>
                                                <p className="font-bold text-gray-900 dark:text-white mt-1">₹{item.price.toLocaleString()}</p>
                                            </div>
                                            <button
                                                onClick={() => removeFromWishlist(item.id)}
                                                className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950"
                                            >
                                                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Addresses */}
                    {tab === 'addresses' && (
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-5">Saved Addresses</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Home', address: 'Shop 12, Sadar Bazar, Mumbai, Maharashtra 400001', isDefault: true },
                                    { label: 'Shop', address: '45 Electronics Market, Nehru Place, Delhi 110019', isDefault: false },
                                ].map((addr, i) => (
                                    <div key={i} className={`card p-5 relative ${addr.isDefault ? 'border-blue-300 dark:border-blue-700' : ''}`}>
                                        {addr.isDefault && (
                                            <span className="absolute top-3 right-3 badge bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs">Default</span>
                                        )}
                                        <div className="flex items-start gap-3">
                                            <MapPin className={`w-5 h-5 mt-0.5 shrink-0 ${addr.isDefault ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white mb-1">{addr.label}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{addr.address}</p>
                                                <div className="flex gap-3 mt-3">
                                                    <button className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">Edit</button>
                                                    {!addr.isDefault && <button className="text-xs text-gray-400 hover:text-red-500 font-medium">Delete</button>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="card p-5 border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-blue-600 transition-all min-h-[120px]">
                                    <span className="text-3xl">+</span>
                                    <span className="text-sm font-medium">Add New Address</span>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Profile */}
                    {tab === 'profile' && (
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-5">Profile Settings</h2>
                            <div className="card p-6 max-w-xl space-y-4">
                                {[
                                    { label: 'Full Name', key: 'name' },
                                    { label: 'Email', key: 'email', type: 'email' },
                                    { label: 'Phone', key: 'phone', type: 'tel' },
                                    { label: 'Shop Name', key: 'shopName' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">{f.label}</label>
                                        <input
                                            type={f.type || 'text'}
                                            value={profile[f.key]}
                                            onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                                            className="input-field"
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Account Type</label>
                                    <select value={profile.type} onChange={e => setProfile(p => ({ ...p, type: e.target.value }))} className="input-field">
                                        <option>Individual</option>
                                        <option>Repair Shop</option>
                                        <option>Wholesaler</option>
                                    </select>
                                </div>
                                <button className="btn-primary mt-2">Save Changes</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
