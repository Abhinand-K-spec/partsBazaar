import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Zap, TrendingUp, Star, ChevronRight } from 'lucide-react';
import { technicianOffers, sampleSearchSuggestions, phoneModels } from '../data/mockData';
import { apiGetTrendingProducts, apiGetRareProducts, apiGetBrands, apiGetProducts, apiGetCategories } from '../data/api';
import ProductCard from '../components/products/ProductCard';

const heroSearches = ['iPhone 11 Display', 'Redmi Note 8 Charging Port', 'Samsung A50 Battery', 'Nokia 6 Power Button'];

function HeroSection() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSugg, setShowSugg] = useState(false);
    const [placeholder, setPlaceholder] = useState(heroSearches[0]);
    const [placeholderIdx, setPlaceholderIdx] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderIdx(prev => {
                const next = (prev + 1) % heroSearches.length;
                setPlaceholder(heroSearches[next]);
                return next;
            });
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (q) => {
        setQuery(q);
        if (q.length > 1) {
            const all = [...sampleSearchSuggestions, ...phoneModels];
            setSuggestions(all.filter(s => s.toLowerCase().includes(q.toLowerCase())).slice(0, 6));
            setShowSugg(true);
        } else {
            setShowSugg(false);
        }
    };

    const submit = (q) => {
        navigate(`/search?q=${encodeURIComponent(q || query)}`);
        setShowSugg(false);
    };

    return (
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 py-20 px-4">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-700/20 rounded-full blur-3xl" />
                <div className="absolute bottom-0 -left-24 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-800/50 border border-blue-700/50 text-blue-200 text-sm mb-6 backdrop-blur-sm">
                    <Zap className="w-4 h-4 text-orange-400" />
                    India's #1 Rare Spare Parts Marketplace — 50,000+ Parts
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight">
                    Find Spare Parts for<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Any Phone Model</span>
                </h1>

                <p className="text-blue-200 text-lg mb-8 max-w-xl mx-auto">
                    From common to rare — displays, batteries, ports & more. Trusted by 10,000+ repair technicians.
                </p>

                <div className="relative max-w-2xl mx-auto">
                    <div className="flex items-center bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-visible border border-white/20">
                        <div className="flex-1 relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={query}
                                onChange={e => handleSearch(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && submit()}
                                onFocus={() => query.length > 1 && setShowSugg(true)}
                                onBlur={() => setTimeout(() => setShowSugg(false), 200)}
                                placeholder={`Search: "${placeholder}"...`}
                                className="w-full pl-12 pr-4 py-4 bg-transparent text-gray-900 dark:text-white text-base placeholder-gray-400 focus:outline-none"
                            />
                        </div>
                        <button
                            onClick={() => submit()}
                            className="shrink-0 m-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2"
                        >
                            <Search className="w-4 h-4" /> Search
                        </button>
                    </div>

                    {showSugg && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onMouseDown={() => submit(s)}
                                    className="w-full flex items-center gap-3 px-5 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-800 text-left transition-colors"
                                >
                                    <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap justify-center gap-2 mt-6">
                    {heroSearches.map(s => (
                        <button
                            key={s}
                            onClick={() => submit(s)}
                            className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm backdrop-blur-sm transition-all"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap justify-center gap-8 mt-12">
                    {[
                        { value: '50,000+', label: 'Spare Parts' },
                        { value: '10,000+', label: 'Repair Shops' },
                        { value: '500+', label: 'Phone Models' },
                        { value: '24hr', label: 'Fast Shipping' },
                    ].map(s => (
                        <div key={s.label} className="text-center">
                            <p className="text-3xl font-extrabold text-white">{s.value}</p>
                            <p className="text-blue-300 text-sm">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function RarePartFinder() {
    const [model, setModel] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState(null);
    const navigate = useNavigate();

    const handleFind = async () => {
        if (!model) return;
        setLoading(true);
        setResults(null);
        try {
            const { data } = await apiGetProducts({ q: model });
            setResults(data.products || []);
        } catch {
            setResults([]);
        }
        setLoading(false);
    };

    return (
        <section className="bg-gradient-to-br from-purple-950 via-indigo-950 to-blue-950 rounded-3xl p-8 my-12 mx-4 sm:mx-6 max-w-5xl xl:mx-auto">
            <div className="text-center mb-8">
                <span className="badge bg-purple-600/30 text-purple-300 border border-purple-500/30 text-sm mb-3">
                    <Zap className="w-4 h-4" /> Rare Part Finder
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Can't Find Your Part?</h2>
                <p className="text-purple-200 text-sm">Tell us the phone model — we'll find exact compatible parts</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
                <input
                    value={model}
                    onChange={e => setModel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleFind()}
                    placeholder="Phone model (e.g. Nokia 6, iPhone X)"
                    className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm"
                    list="model-list"
                />
                <datalist id="model-list">
                    {phoneModels.map(m => <option key={m} value={m} />)}
                </datalist>

                <button
                    onClick={handleFind}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all active:scale-95 shadow-lg flex items-center gap-2 justify-center"
                >
                    {loading ? <span className="animate-spin">⟳</span> : <Search className="w-4 h-4" />}
                    Find Parts
                </button>
            </div>

            {results !== null && (
                <div className="mt-8">
                    {results.length === 0 ? (
                        <div className="text-center text-purple-300 py-6">
                            <p className="text-lg font-semibold mb-1">No exact match found</p>
                            <p className="text-sm">Submit a request and we'll source it for you!</p>
                            <button className="mt-4 px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-all text-sm">
                                Submit Part Request
                            </button>
                        </div>
                    ) : (
                        <div>
                            <p className="text-purple-200 text-sm mb-4 text-center">Found {results.length} compatible part{results.length !== 1 ? 's' : ''}</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {results.slice(0, 3).map(p => (
                                    <ProductCard key={p._id} product={p} />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}

export default function HomePage() {
    const navigate = useNavigate();
    const [trending, setTrending] = useState([]);
    const [rare, setRare] = useState([]);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingTrending, setLoadingTrending] = useState(true);
    const [loadingRare, setLoadingRare] = useState(true);

    useEffect(() => {
        apiGetTrendingProducts()
            .then(res => setTrending(res.data.products || []))
            .catch(() => {})
            .finally(() => setLoadingTrending(false));

        apiGetRareProducts()
            .then(res => setRare(res.data.products || []))
            .catch(() => {})
            .finally(() => setLoadingRare(false));

        apiGetBrands()
            .then(res => setBrands(res.data.brands || []))
            .catch(() => {});

        apiGetCategories()
            .then(res => setCategories(res.data.categories || []))
            .catch(() => {});
    }, []);

    const popularModels = [
        { name: 'iPhone 11', image: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=200&h=200&fit=crop', count: 48 },
        { name: 'Samsung A50', image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop', count: 62 },
        { name: 'Redmi Note 8', image: 'https://images.unsplash.com/photo-1595941169437-bd5a40d0e7e1?w=200&h=200&fit=crop', count: 55 },
        { name: 'iPhone X', image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=200&h=200&fit=crop', count: 38 },
        { name: 'Galaxy M32', image: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=200&h=200&fit=crop', count: 44 },
        { name: 'POCO F1', image: 'https://images.unsplash.com/photo-1595941169437-bd5a40d0e7e1?w=200&h=200&fit=crop', count: 29 },
    ];

    return (
        <div className="min-h-screen">
            <HeroSection />

            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Categories from DB */}
                {categories.length > 0 && (
                    <section className="py-12">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="section-title">Browse by Category</h2>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-10 gap-3">
                            {categories.map(cat => (
                                <button
                                    key={cat._id}
                                    onClick={() => navigate(`/search?category=${encodeURIComponent(cat.name)}`)}
                                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                                >
                                    <span className="text-2xl">{cat.icon || '📦'}</span>
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 text-center leading-tight">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Trending */}
                <section className="py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-orange-500" />
                            <h2 className="section-title">Trending Spare Parts</h2>
                        </div>
                        <button onClick={() => navigate('/search?trending=true')} className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            View All <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {loadingTrending
                            ? [...Array(4)].map((_, i) => <ProductCard key={i} skeleton />)
                            : trending.length > 0
                                ? trending.map(p => <ProductCard key={p._id} product={p} />)
                                : <p className="col-span-4 text-center text-gray-400 py-8">No trending products yet.</p>
                        }
                    </div>
                </section>

                {/* Popular Phone Models */}
                <section className="py-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="section-title">Popular Phone Models</h2>
                        <button onClick={() => navigate('/search')} className="text-blue-600 dark:text-blue-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            All Models <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {popularModels.map(m => (
                            <button
                                key={m.name}
                                onClick={() => navigate(`/search?q=${encodeURIComponent(m.name)}`)}
                                className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 text-center"
                            >
                                <img src={m.image} alt={m.name} className="w-16 h-16 object-cover rounded-xl mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{m.name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{m.count} parts</p>
                            </button>
                        ))}
                    </div>
                </section>

                {/* Top Brands — from DB */}
                {brands.length > 0 && (
                    <section className="py-8">
                        <h2 className="section-title mb-6">Top Brands</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                            {brands.map(brand => (
                                <button
                                    key={brand._id}
                                    onClick={() => navigate(`/search?brand=${encodeURIComponent(brand.name)}`)}
                                    className="group flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                                >
                                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${brand.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform`}>
                                        {brand.logo}
                                    </div>
                                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{brand.name}</p>
                                    <p className="text-xs text-gray-400">{brand.count} parts</p>
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Rare Parts */}
                <section className="py-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <Zap className="w-5 h-5 text-purple-500" />
                            <h2 className="section-title">Rare &amp; Hard-to-Find Parts</h2>
                        </div>
                        <button onClick={() => navigate('/search?rare=true')} className="text-purple-600 dark:text-purple-400 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
                            All Rare Parts <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {loadingRare
                            ? [...Array(4)].map((_, i) => <ProductCard key={i} skeleton />)
                            : rare.length > 0
                                ? rare.map(p => <ProductCard key={p._id} product={p} />)
                                : <p className="col-span-4 text-center text-gray-400 py-8">No rare products yet.</p>
                        }
                    </div>
                </section>

                {/* Technician Offers */}
                <section className="py-8">
                    <h2 className="section-title mb-6">🏪 For Repair Technicians</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {technicianOffers.map(offer => (
                            <div key={offer.id} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${offer.color} p-6 text-white group cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
                                <div className="absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full" />
                                <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
                                <div className="relative">
                                    <span className="text-3xl mb-3 block">{offer.icon}</span>
                                    <span className="badge bg-white/20 text-white text-xs mb-3">{offer.badge}</span>
                                    <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                                    <p className="text-sm opacity-80">{offer.description}</p>
                                    <button className="mt-4 flex items-center gap-1.5 text-sm font-semibold opacity-80 hover:opacity-100 transition-opacity group-hover:gap-2.5">
                                        Learn More <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <RarePartFinder />
        </div>
    );
}
