import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    LayoutDashboard, Package, ShoppingBag, Users, Settings, Bell,
    TrendingUp, AlertTriangle, Plus, X, Search, MoreVertical,
    DollarSign, ShoppingCart, Star, ArrowUp, ArrowDown, Eye, Edit, Trash2,
    Wrench, ChevronDown, Menu
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
    adminSalesData, adminTopParts, adminUsers
} from '../data/mockData';
import CategoryManager from '../components/admin/CategoryManager';
import BrandManager from '../components/admin/BrandManager';
import { apiGetBrands, apiGetCategories, apiCreateProduct, apiUploadImage, apiGetProducts, apiDeleteProduct } from '../data/api';
import toast from 'react-hot-toast';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');
const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/40x40?text=?';
    if (img.startsWith('http')) return img;
    return `${API_BASE}${img}`;
};

const generateSKU = (brandName, categoryName) => {
    const b = (brandName || 'XX').slice(0, 3).toUpperCase();
    const c = (categoryName || 'YY').slice(0, 3).toUpperCase();
    const ts = Date.now().toString().slice(-6);
    return `${b}-${c}-${ts}`;
};

const NAV_ITEMS = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    { key: 'users', label: 'Users', icon: Users },
    { key: 'inventory', label: 'Inventory', icon: TrendingUp },
    { key: 'categories', label: 'Categories', icon: Settings },
    { key: 'brands', label: 'Brands', icon: Star },
];

const PART_COLORS = ['#3b82f6', '#f97316', '#8b5cf6', '#10b981', '#f59e0b'];

function StatCard({ label, value, change, icon: Icon, color }) {
    const isPositive = change >= 0;
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-start justify-between mb-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                    {Math.abs(change)}%
                </span>
            </div>
            <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
        </div>
    );
}

function AddProductModal({ onClose }) {
    const [form, setForm] = useState({ name: '', brand: '', category: '', model: '', price: '', stock: '', isRare: false, compatibleModels: '' });
    const [imageFile, setImageFile] = useState(null);
    const [specifications, setSpecifications] = useState([]);
    const [brandsList, setBrandsList] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        async function fetchData() {
            try {
                const [bRes, cRes] = await Promise.all([apiGetBrands(), apiGetCategories()]);
                setBrandsList(bRes.data.brands || []);
                setCategoriesList(cRes.data.categories || []);
            } catch (err) { console.error(err); }
        }
        fetchData();
    }, []);

    const handleAddSpec = () => setSpecifications([...specifications, { key: '', value: '' }]);
    const handleSpecChange = (index, field, val) => {
        const newSpecs = [...specifications];
        newSpecs[index][field] = val;
        setSpecifications(newSpecs);
    };
    const handleRemoveSpec = (index) => setSpecifications(specifications.filter((_, i) => i !== index));

    const handleSubmit = async () => {
        if (!form.name || !form.brand || !form.category || !form.price || !form.model) {
            toast.error('Please fill all required fields (Name, Brand, Category, Model, Price)');
            return;
        }
        if (!imageFile) {
            toast.error('Product image is required');
            return;
        }
        setLoading(true);
        const tid = toast.loading('Adding product...');
        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            const uploadRes = await apiUploadImage(formData);
            const imagePath = uploadRes.data.imagePath;

            const selectedBrand = brandsList.find(b => b._id === form.brand);
            const selectedCategory = categoriesList.find(c => c._id === form.category);

            const specsObj = {};
            specifications.forEach(spec => {
                if (spec.key && spec.value) specsObj[spec.key] = spec.value;
            });

            const productData = {
                ...form,
                image: imagePath,
                sku: generateSKU(selectedBrand?.name, selectedCategory?.name),
                specifications: specsObj,
                compatibleModels: form.compatibleModels.split(',').map(s => s.trim()).filter(Boolean),
                brandName: selectedBrand?.name || '',
                categoryName: selectedCategory?.name || '',
            };

            await apiCreateProduct(productData);
            toast.success('Product added successfully!', { id: tid });
            onClose();
        } catch (error) {
            console.error('Error creating product:', error);
            toast.error(error.response?.data?.message || error.message, { id: tid });
        }
        setLoading(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800 shrink-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                        <Plus className="w-5 h-5 text-blue-600" /> Add New Product
                    </h3>
                    <button onClick={onClose} className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-5 space-y-4 overflow-y-auto flex-1">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Product Name</label>
                            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="iPhone 11 OLED Display Assembly" className="w-full input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Brand</label>
                            <select value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} className="w-full input-field">
                                <option value="">Select Brand</option>
                                {brandsList.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Category</label>
                            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full input-field">
                                <option value="">Select Category</option>
                                {categoriesList.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Product Model (e.g. iPhone 11)</label>
                            <input value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))} placeholder="iPhone 11" className="w-full input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Product Image (Upload)</label>
                            <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="w-full input-field file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Sale Price (₹)</label>
                            <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="1499" className="w-full input-field" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Stock Quantity</label>
                            <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="50" className="w-full input-field" />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5">Compatible Models (Comma Separated)</label>
                            <input value={form.compatibleModels} onChange={e => setForm(f => ({ ...f, compatibleModels: e.target.value }))} placeholder="iPhone 11, iPhone 11 (A2221)" className="w-full input-field" />
                        </div>
                        <div className="col-span-2">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div
                                    onClick={() => setForm(f => ({ ...f, isRare: !f.isRare }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${form.isRare ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                                >
                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isRare ? 'translate-x-5' : ''}`} />
                                </div>
                                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">⚡ Mark as Rare Part</span>
                            </label>
                        </div>
                        
                        {/* Specifications Section */}
                        <div className="col-span-2 mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-bold text-gray-200">Specifications</label>
                                <button type="button" onClick={handleAddSpec} className="text-xs bg-gray-800 text-white px-3 py-1.5 rounded-lg hover:bg-gray-700 flex items-center gap-1">
                                    <Plus className="w-3 h-3" /> Add Spec
                                </button>
                            </div>
                            <div className="space-y-2">
                                {specifications.map((spec, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input value={spec.key} onChange={e => handleSpecChange(index, 'key', e.target.value)} placeholder="Key (e.g. Type)" className="flex-1 input-field" />
                                        <input value={spec.value} onChange={e => handleSpecChange(index, 'value', e.target.value)} placeholder="Value (e.g. OLED)" className="flex-1 input-field" />
                                        <button onClick={() => handleRemoveSpec(index)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><X className="w-4 h-4"/></button>
                                    </div>
                                ))}
                                {specifications.length === 0 && <p className="text-xs text-gray-500 italic">No specifications added yet.</p>}
                            </div>
                        </div>

                    </div>
                </div>
                <div className="p-5 border-t border-gray-100 dark:border-gray-800 flex gap-3 shrink-0">
                    <button onClick={onClose} className="btn-outline flex-1 justify-center">Cancel</button>
                    <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 justify-center">
                        {loading ? 'Adding...' : 'Add Product'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const [activeNav, setActiveNav] = useState('overview');
    const [showModal, setShowModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    const [dbProducts, setDbProducts] = useState([]);
    const [productsLoading, setProductsLoading] = useState(false);

    const fetchProducts = () => {
        setProductsLoading(true);
        apiGetProducts({ q: productSearch, limit: 100 })
            .then(res => setDbProducts(res.data.products || []))
            .catch(() => {})
            .finally(() => setProductsLoading(false));
    };

    useEffect(() => {
        if (activeNav === 'overview' || activeNav === 'products' || activeNav === 'inventory') fetchProducts();
    }, [activeNav, productSearch]);

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await apiDeleteProduct(id);
            toast.success('Product deleted');
            fetchProducts();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete');
        }
    };

    const filteredProducts = dbProducts;

    const mockOrders = [
        { id: 'ORD-001', customer: 'Ravi Kumar', items: 3, total: 5420, status: 'delivered', date: '2025-01-08' },
        { id: 'ORD-002', customer: 'TechFix Pro', items: 12, total: 28450, status: 'shipped', date: '2025-01-08' },
        { id: 'ORD-003', customer: 'Anita Sharma', items: 1, total: 2499, status: 'packed', date: '2025-01-08' },
        { id: 'ORD-004', customer: 'Khurram Mobiles', items: 25, total: 62100, status: 'ordered', date: '2025-01-07' },
        { id: 'ORD-005', customer: 'Sanjay Singh', items: 2, total: 1850, status: 'delivered', date: '2025-01-07' },
    ];

    const STATUS_COLORS_MAP = {
        ordered: 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300',
        packed: 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300',
        shipped: 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300',
        delivered: 'bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300',
    };

    const Sidebar = ({ mobile }) => (
        <div className={`${mobile ? 'p-4' : 'p-5'} flex flex-col h-full`}>
            <Link to="/" className="flex items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                    <Wrench className="w-5 h-5 text-white" />
                </div>
                <div>
                    <p className="font-bold text-white text-base leading-none">PartsBazaar</p>
                    <p className="text-xs text-blue-400 leading-none">Admin Panel</p>
                </div>
            </Link>

            <nav className="flex-1 space-y-1">
                {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                    <button
                        key={key}
                        onClick={() => { setActiveNav(key); setSidebarOpen(false); }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeNav === key
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-400 hover:bg-white/10 hover:text-white'
                            }`}
                    >
                        <Icon className="w-4.5 h-4.5" /> {label}
                    </button>
                ))}
            </nav>

            <div className="mt-6 pt-6 border-t border-gray-700">
                <Link to="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                    ← Back to Storefront
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex bg-gray-950">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-60 bg-gray-900 border-r border-gray-800 shrink-0 fixed left-0 top-0 bottom-0 z-30">
                <Sidebar />
            </aside>

            {/* Mobile Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
                        <Sidebar mobile />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur border-b border-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800">
                            <Menu className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="font-bold text-white text-lg capitalize">{
                                activeNav === 'overview' ? 'Dashboard Overview' :
                                    activeNav === 'products' ? 'Product Management' :
                                        activeNav === 'orders' ? 'Order Management' :
                                            activeNav === 'users' ? 'User Management' :
                                                activeNav === 'categories' ? 'Category Management' :
                                                    activeNav === 'brands' ? 'Brand Management' : 'Inventory'
                            }</h1>
                            <p className="text-xs text-gray-400">Welcome back, Admin</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="relative p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                        </button>
                        <button
                            onClick={() => setShowModal(true)}
                            className="btn-primary text-xs px-4"
                        >
                            <Plus className="w-4 h-4" /> Add Product
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 space-y-6">
                    {/* Overview */}
                    {activeNav === 'overview' && (
                        <>
                            {/* Stats */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total Revenue" value="₹4.97L" change={12.5} icon={DollarSign} color="bg-blue-600" />
                                <StatCard label="Total Orders" value="2,050" change={8.2} icon={ShoppingCart} color="bg-orange-500" />
                                <StatCard label="Total Products" value={dbProducts.length} change={5.1} icon={Package} color="bg-purple-600" />
                                <StatCard label="Active Users" value="1,248" change={-2.1} icon={Users} color="bg-emerald-600" />
                            </div>

                            {/* Charts */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                {/* Sales chart */}
                                <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-5 border border-gray-800">
                                    <div className="flex items-center justify-between mb-5">
                                        <h3 className="font-bold text-white">Revenue & Orders</h3>
                                        <select className="text-xs bg-gray-800 border border-gray-700 text-gray-400 rounded-lg px-3 py-1.5 focus:outline-none">
                                            <option>Last 7 months</option>
                                        </select>
                                    </div>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={adminSalesData}>
                                            <defs>
                                                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                                            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
                                            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                                            <Tooltip
                                                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, color: '#f9fafb' }}
                                                formatter={(val, name) => [name === 'revenue' ? `₹${val.toLocaleString()}` : val, name === 'revenue' ? 'Revenue' : 'Orders']}
                                            />
                                            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fill="url(#revGrad)" strokeWidth={2.5} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Top parts pie */}
                                <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                                    <h3 className="font-bold text-white mb-4">Top Selling Parts</h3>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie data={adminTopParts} dataKey="sold" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                                                {adminTopParts.map((_, i) => (
                                                    <Cell key={i} fill={PART_COLORS[i % PART_COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, color: '#f9fafb' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="space-y-1.5 mt-2">
                                        {adminTopParts.slice(0, 3).map((p, i) => (
                                            <div key={p.name} className="flex items-center justify-between text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: PART_COLORS[i] }} />
                                                    <span className="text-gray-400 line-clamp-1 max-w-[130px]">{p.name}</span>
                                                </div>
                                                <span className="text-gray-300 font-medium">{p.sold}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Low stock + Orders bar chart */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                {/* Low stock */}
                                <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                                    <div className="flex items-center gap-2 mb-4">
                                        <AlertTriangle className="w-5 h-5 text-orange-400" />
                                        <h3 className="font-bold text-white">Low Stock Alerts</h3>
                                        <span className="badge bg-orange-500/20 text-orange-400 text-xs ml-auto">{dbProducts.filter(p => p.stock > 0 && p.stock <= 5).length} items</span>
                                    </div>
                                    <div className="space-y-3">
                                        {dbProducts.filter(p => p.stock > 0 && p.stock <= 5).map(p => (
                                            <div key={p._id} className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                                                <img src={getImageUrl(p.image)} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-white line-clamp-1">{p.name}</p>
                                                    <p className="text-xs text-gray-400">{p.brandName}</p>
                                                </div>
                                                <span className="text-orange-400 font-bold text-sm shrink-0">{p.stock} left</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Orders bar */}
                                <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
                                    <h3 className="font-bold text-white mb-4">Monthly Orders</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <BarChart data={adminSalesData}>
                                            <CartesianGrid stroke="#1f2937" strokeDasharray="3 3" />
                                            <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 11 }} />
                                            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                                            <Tooltip
                                                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, color: '#f9fafb' }}
                                            />
                                            <Bar dataKey="orders" fill="#f97316" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Products */}
                    {activeNav === 'products' && (
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="flex items-center justify-between p-5 border-b border-gray-800 flex-wrap gap-3">
                                <h3 className="font-bold text-white">Products ({filteredProducts.length})</h3>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            value={productSearch}
                                            onChange={e => setProductSearch(e.target.value)}
                                            placeholder="Search products..."
                                            className="pl-9 pr-4 py-2 rounded-xl bg-gray-800 border border-gray-700 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-56"
                                        />
                                    </div>
                                    <button onClick={() => setShowModal(true)} className="btn-primary text-xs">
                                        <Plus className="w-4 h-4" /> Add
                                    </button>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-800/50 text-gray-400 text-xs">
                                        <tr>
                                            {['Product', 'Brand', 'Type', 'Price', 'Stock', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {productsLoading ? (
                                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">Loading...</td></tr>
                                        ) : filteredProducts.length === 0 ? (
                                            <tr><td colSpan={7} className="text-center py-8 text-gray-400">No products found. Add one!</td></tr>
                                        ) : filteredProducts.map(p => (
                                            <tr key={p._id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={getImageUrl(p.image)} alt={p.name} className="w-10 h-10 rounded-xl object-cover" />
                                                        <div>
                                                            <p className="text-white font-medium line-clamp-1 max-w-[200px]">{p.name}</p>
                                                            <p className="text-xs text-gray-500">{p.sku}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-300">{p.brandName}</td>
                                                <td className="px-4 py-3 text-gray-300 capitalize">{p.categoryName}</td>
                                                <td className="px-4 py-3 text-white font-semibold">₹{p.price?.toLocaleString()}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`font-semibold ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-orange-400' : 'text-green-400'}`}>
                                                        {p.stock === 0 ? 'Out' : p.stock}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex gap-1">
                                                        {p.isRare && <span className="badge bg-purple-500/20 text-purple-300 text-xs">Rare</span>}
                                                        {p.isTrending && <span className="badge bg-orange-500/20 text-orange-300 text-xs">Trending</span>}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Eye className="w-4 h-4" /></button>
                                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-orange-400 hover:bg-orange-500/10 transition-all"><Edit className="w-4 h-4" /></button>
                                                        <button onClick={() => handleDeleteProduct(p._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Orders */}
                    {activeNav === 'orders' && (
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="p-5 border-b border-gray-800">
                                <h3 className="font-bold text-white">Recent Orders</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-800/50 text-gray-400 text-xs">
                                        <tr>
                                            {['Order ID', 'Customer', 'Items', 'Total', 'Date', 'Status', 'Actions'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {mockOrders.map(order => (
                                            <tr key={order.id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-4 py-3 text-blue-400 font-mono font-medium">{order.id}</td>
                                                <td className="px-4 py-3 text-gray-200">{order.customer}</td>
                                                <td className="px-4 py-3 text-gray-400">{order.items} items</td>
                                                <td className="px-4 py-3 text-white font-semibold">₹{order.total.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-gray-400">{order.date}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`badge text-xs capitalize ${STATUS_COLORS_MAP[order.status]}`}>{order.status}</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Eye className="w-4 h-4" /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Users */}
                    {activeNav === 'users' && (
                        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                            <div className="p-5 border-b border-gray-800">
                                <h3 className="font-bold text-white">Registered Users ({adminUsers.length})</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-gray-800/50 text-gray-400 text-xs">
                                        <tr>
                                            {['Name', 'Email', 'Type', 'Orders', 'Total Spent', 'Joined', 'Actions'].map(h => (
                                                <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {adminUsers.map(user => (
                                            <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-xs font-bold">
                                                            {user.name[0]}
                                                        </div>
                                                        <span className="text-white font-medium">{user.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-400">{user.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`badge text-xs ${user.type === 'Repair Shop' ? 'bg-blue-500/20 text-blue-300' : 'bg-gray-500/20 text-gray-400'}`}>{user.type}</span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-300">{user.orders}</td>
                                                <td className="px-4 py-3 text-white font-semibold">₹{user.spent.toLocaleString()}</td>
                                                <td className="px-4 py-3 text-gray-400">{user.joined}</td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-1">
                                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"><Eye className="w-4 h-4" /></button>
                                                        <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all"><Trash2 className="w-4 h-4" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Inventory */}
                    {activeNav === 'inventory' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <StatCard label="Total SKUs" value={dbProducts.length} change={0} icon={Package} color="bg-blue-600" />
                                <StatCard label="In Stock" value={dbProducts.filter(p => p.stock > 0).length} change={3.2} icon={TrendingUp} color="bg-green-600" />
                                <StatCard label="Low Stock" value={dbProducts.filter(p => p.stock > 0 && p.stock <= 5).length} change={-15} icon={AlertTriangle} color="bg-orange-500" />
                                <StatCard label="Out of Stock" value={dbProducts.filter(p => p.stock === 0).length} change={20} icon={Package} color="bg-red-600" />
                            </div>

                            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                                <div className="p-5 border-b border-gray-800">
                                    <h3 className="font-bold text-white flex items-center gap-2">
                                        <AlertTriangle className="w-5 h-5 text-orange-400" /> Low Stock & Out of Stock
                                    </h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-800/50 text-gray-400 text-xs">
                                            <tr>
                                                {['Product', 'SKU', 'Brand', 'Stock', 'Price', 'Action'].map(h => (
                                                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-800">
                                            {dbProducts.filter(p => p.stock <= 5).map(p => (
                                                <tr key={p._id} className="hover:bg-gray-800/30 transition-colors">
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <img src={getImageUrl(p.image)} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                                                            <span className="text-white font-medium line-clamp-1 max-w-[200px]">{p.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{p.sku}</td>
                                                    <td className="px-4 py-3 text-gray-300">{p.brandName}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`font-bold ${p.stock === 0 ? 'text-red-400' : 'text-orange-400'}`}>
                                                            {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-white">₹{p.price.toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <button className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg transition-colors">
                                                            Restock
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Categories UI */}
                    {activeNav === 'categories' && <CategoryManager />}

                    {/* Brands UI */}
                    {activeNav === 'brands' && <BrandManager />}
                </main>
            </div>

            {/* Add Product Modal */}
            {showModal && <AddProductModal onClose={() => setShowModal(false)} />}
        </div>
    );
}
