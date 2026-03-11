import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';
import { apiGetProducts, apiGetBrands, apiGetCategories } from '../data/api';
import ProductCard from '../components/products/ProductCard';

const priceRanges = [
    { label: 'Under ₹500', min: 0, max: 500 },
    { label: '₹500 – ₹1,000', min: 500, max: 1000 },
    { label: '₹1,000 – ₹2,000', min: 1000, max: 2000 },
    { label: '₹2,000 – ₹5,000', min: 2000, max: 5000 },
    { label: 'Above ₹5,000', min: 5000, max: 999999 },
];

function FilterSection({ title, children, defaultOpen = true }) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="border-b border-gray-100 dark:border-gray-800 py-4">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center justify-between w-full text-sm font-semibold text-gray-900 dark:text-white mb-2"
            >
                {title} {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {open && children}
        </div>
    );
}

export default function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [filters, setFilters] = useState({
        brand: searchParams.get('brand') || '',
        category: searchParams.get('category') || '',
        priceRange: null,
        availability: false,
        rare: searchParams.get('rare') === 'true',
    });
    const [query, setQuery] = useState(searchParams.get('q') || '');
    const [sort, setSort] = useState('popular');
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);

    // Load brands and categories for filter sidebar
    useEffect(() => {
        apiGetBrands().then(res => setBrands(res.data.brands || [])).catch(() => {});
        apiGetCategories().then(res => setCategories(res.data.categories || [])).catch(() => {});
    }, []);

    // Sync state when URL params change
    useEffect(() => {
        setQuery(searchParams.get('q') || '');
        setFilters(f => ({
            ...f,
            brand: searchParams.get('brand') || '',
            category: searchParams.get('category') || '',
            rare: searchParams.get('rare') === 'true',
        }));
    }, [searchParams]);

    // Fetch products whenever filters/query/sort change
    useEffect(() => {
        setLoading(true);
        const params = {
            ...(query && { q: query }),
            ...(filters.brand && { brand: filters.brand }),
            ...(filters.category && { category: filters.category }),
            ...(filters.rare && { rare: true }),
            ...(filters.availability && { inStock: true }),
            ...(filters.priceRange && { minPrice: filters.priceRange.min, maxPrice: filters.priceRange.max }),
            sort,
            limit: 50,
        };
        apiGetProducts(params)
            .then(res => {
                let result = res.data.products || [];
                setProducts(result);
                setTotal(res.data.total || result.length);
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [query, filters, sort]);

    const setFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));

    const activeFilterCount = [
        filters.brand, filters.category, filters.priceRange, filters.rare, filters.availability
    ].filter(Boolean).length;

    const clearAll = () => setFilters({ brand: '', category: '', priceRange: null, availability: false, rare: false });

    const Sidebar = () => (
        <div className="w-full space-y-0">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                    {activeFilterCount > 0 && (
                        <span className="badge bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">{activeFilterCount}</span>
                    )}
                </h3>
                {activeFilterCount > 0 && (
                    <button onClick={clearAll} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                        <X className="w-3 h-3" /> Clear all
                    </button>
                )}
            </div>

            {/* Rare toggle */}
            <div className="border-b border-gray-100 dark:border-gray-800 py-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                    <div className={`relative w-11 h-6 rounded-full transition-colors ${filters.rare ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${filters.rare ? 'translate-x-5' : ''}`} />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">⚡ Rare Parts Only</span>
                    <input type="checkbox" checked={filters.rare} onChange={e => setFilter('rare', e.target.checked)} className="sr-only" />
                </label>
            </div>

            {/* Availability */}
            <div className="border-b border-gray-100 dark:border-gray-800 py-4">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={filters.availability}
                        onChange={e => setFilter('availability', e.target.checked)}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">In Stock Only</span>
                </label>
            </div>

            {/* Brand */}
            {brands.length > 0 && (
                <FilterSection title="Brand">
                    <div className="space-y-1.5 mt-2">
                        {brands.map(b => (
                            <label key={b._id} className="flex items-center gap-2.5 cursor-pointer group">
                                <input
                                    type="radio"
                                    name="brand"
                                    checked={filters.brand === b.name}
                                    onChange={() => setFilter('brand', filters.brand === b.name ? '' : b.name)}
                                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">{b.name}</span>
                            </label>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Category — from DB */}
            {categories.length > 0 && (
                <FilterSection title="Category">
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                        {categories.map(cat => (
                            <button
                                key={cat._id}
                                onClick={() => setFilter('category', filters.category === cat.name ? '' : cat.name)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${filters.category === cat.name
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700'
                                    }`}
                            >
                                <span>{cat.icon || '📦'}</span> {cat.name}
                            </button>
                        ))}
                    </div>
                </FilterSection>
            )}

            {/* Price Range */}
            <FilterSection title="Price Range">
                <div className="space-y-1.5 mt-2">
                    {priceRanges.map((pr, i) => (
                        <label key={i} className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="radio"
                                name="price"
                                checked={filters.priceRange === pr}
                                onChange={() => setFilter('priceRange', filters.priceRange === pr ? null : pr)}
                                className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{pr.label}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                        {query ? `Results for "${query}"` : filters.rare ? '⚡ Rare Parts' : 'All Spare Parts'}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{loading ? 'Searching...' : `${products.length} products found`}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setSidebarOpen(true)} className="lg:hidden flex items-center gap-2 btn-outline text-xs">
                        <Filter className="w-4 h-4" /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                    </button>
                    <select value={sort} onChange={e => setSort(e.target.value)} className="input-field max-w-[180px] text-xs py-2">
                        <option value="popular">Most Popular</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Best Rating</option>
                    </select>
                </div>
            </div>

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-5">
                    {filters.brand && (
                        <span className="badge bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 gap-1">
                            {filters.brand} <button onClick={() => setFilter('brand', '')}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                    {filters.category && (
                        <span className="badge bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 gap-1">
                            {filters.category} <button onClick={() => setFilter('category', '')}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                    {filters.rare && (
                        <span className="badge bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 gap-1">
                            Rare Parts <button onClick={() => setFilter('rare', false)}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                    {filters.priceRange && (
                        <span className="badge bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 gap-1">
                            {filters.priceRange.label} <button onClick={() => setFilter('priceRange', null)}><X className="w-3 h-3" /></button>
                        </span>
                    )}
                </div>
            )}

            <div className="flex gap-7">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <div className="card p-5 sticky top-24">
                        <Sidebar />
                    </div>
                </aside>

                {/* Mobile sidebar overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
                        <div className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 overflow-y-auto p-5 shadow-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-gray-900 dark:text-white">Filters</h3>
                                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-gray-500" /></button>
                            </div>
                            <Sidebar />
                            <button className="btn-primary w-full mt-5 justify-center" onClick={() => setSidebarOpen(false)}>
                                Apply Filters ({products.length} results)
                            </button>
                        </div>
                    </div>
                )}

                {/* Products grid */}
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {[...Array(6)].map((_, i) => <ProductCard key={i} skeleton />)}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-5xl mb-4">🔍</p>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No parts found</h3>
                            <p className="text-gray-500 text-sm mb-6">Try a different search or adjust your filters</p>
                            <button onClick={clearAll} className="btn-primary">Clear Filters</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                            {products.map(p => <ProductCard key={p._id} product={p} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
