import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Eye, EyeOff, Wrench, Star, Shield, Truck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const { login, register, loading } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('login');
    const [showPass, setShowPass] = useState(false);
    const [form, setForm] = useState({
        name: '', email: '', password: '', phone: '', shopName: '', accountType: 'Individual',
    });

    const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        // Client-side validation
        if (mode === 'register') {
            if (!form.name || form.name.trim().length < 2) {
                toast.error('Name must be at least 2 characters');
                return;
            }
            const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRx.test(form.email)) {
                toast.error('Please enter a valid email address');
                return;
            }
            if (form.password.length < 6) {
                toast.error('Password must be at least 6 characters');
                return;
            }
            if (form.phone && !/^[6-9]\d{9}$/.test(form.phone)) {
                toast.error('Enter a valid 10-digit Indian mobile number');
                return;
            }
        } else {
            if (!form.email || !form.password) {
                toast.error('Please enter your email and password');
                return;
            }
        }
        try {
            if (mode === 'login') {
                const user = await login(form.email, form.password);
                navigate(user.role === 'admin' ? '/admin' : '/dashboard');
            } else {
                await register(form);
                navigate('/dashboard');
            }
        } catch {
            // toast already fired inside AuthContext
        }
    };

    return (
        <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-0 shadow-2xl rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800">

                {/* ── Left: Branding Panel ── */}
                <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-10 text-white">
                    <div>
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                                <Wrench className="w-6 h-6 text-white" />
                            </div>
                            <span className="font-black text-xl">PartsBazaar</span>
                        </div>
                        <h2 className="text-3xl font-extrabold leading-snug mb-4">
                            India's #1<br />Spare Parts<br />Marketplace
                        </h2>
                        <p className="text-blue-200 text-sm leading-relaxed">
                            Trusted by 10,000+ repair technicians and mobile repair shops across India.
                        </p>
                    </div>

                    <div className="space-y-4 my-10">
                        {[
                            { icon: Star, text: '50,000+ parts in stock' },
                            { icon: Shield, text: 'Genuine quality guaranteed' },
                            { icon: Truck, text: '24hr fast dispatch' },
                        ].map(({ icon: Icon, text }) => (
                            <div key={text} className="flex items-center gap-3 text-sm text-blue-100">
                                <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                                    <Icon className="w-4 h-4" />
                                </div>
                                {text}
                            </div>
                        ))}
                    </div>

                    <p className="text-xs text-blue-400">
                        Demo admin: <span className="font-mono text-blue-200">admin@partsbazaar.in</span> / <span className="font-mono text-blue-200">admin123</span>
                    </p>
                </div>

                {/* ── Right: Form ── */}
                <div className="bg-white dark:bg-gray-900 p-8 sm:p-10 flex flex-col justify-center">
                    {/* Mobile logo */}
                    <div className="flex items-center gap-2 mb-6 lg:hidden">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                            <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-black text-lg text-gray-900 dark:text-white">PartsBazaar</span>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                        {mode === 'login' ? 'Welcome back 👋' : 'Create account'}
                    </h1>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
                        {mode === 'login' ? 'Sign in to track orders and manage your account.' : 'Join 10,000+ repair technicians on PartsBazaar.'}
                    </p>

                    {/* Tab Toggle */}
                    <div className="flex p-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-2xl">
                        {[
                            { id: 'login', label: 'Login', icon: LogIn },
                            { id: 'register', label: 'Register', icon: UserPlus },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => { setMode(id); }}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${mode === id
                                    ? 'bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                    }`}
                            >
                                <Icon className="w-4 h-4" /> {label}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === 'register' && (
                            <>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Full Name *</label>
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Ravi Kumar" className="input-field" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Phone</label>
                                        <input name="phone" value={form.phone} onChange={handleChange} placeholder="9876543210" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Account Type</label>
                                        <select name="accountType" value={form.accountType} onChange={handleChange} className="input-field">
                                            <option>Individual</option>
                                            <option>Repair Shop</option>
                                            <option>Wholesaler</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Shop / Business Name</label>
                                    <input name="shopName" value={form.shopName} onChange={handleChange} placeholder="Ravi Mobile Repair" className="input-field" />
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Email Address *</label>
                            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" required />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Password *</label>
                            <div className="relative">
                                <input
                                    name="password"
                                    type={showPass ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                                    className="input-field pr-10"
                                    required
                                />
                                <button type="button" onClick={() => setShowPass(v => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-sm mt-1">
                            {loading
                                ? <span className="flex items-center gap-2 justify-center"><span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Processing...</span>
                                : mode === 'login' ? 'Login to Account' : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
                        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); }}
                            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                        >
                            {mode === 'login' ? 'Register free' : 'Sign in'}
                        </button>
                    </p>

                    <p className="text-center mt-3">
                        <Link to="/" className="text-xs text-gray-400 hover:text-gray-500">← Continue as Guest</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
