import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart, Sun, Moon, Search, Menu, X, Wrench, ChevronDown } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import { useWishlist } from '../../context/WishlistContext';
import { sampleSearchSuggestions, phoneModels } from '../../data/mockData';
import { apiGetCategories } from '../../data/api';

export default function Navbar() {
    const { totalItems } = useCart();
    const { wishlist } = useWishlist();
    const { isDark, toggleTheme } = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const navigate = useNavigate();
    const searchRef = useRef(null);
    const location = useLocation();
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        apiGetCategories().then(res => setCategories(res.data.categories || [])).catch(() => {});
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        setSelectedIndex(-1);
        if (query.length > 1) {
            const allSuggestions = [...sampleSearchSuggestions, ...phoneModels];
            const filtered = allSuggestions.filter(s =>
                s.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 7);
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, -1));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const q = selectedIndex >= 0 ? suggestions[selectedIndex] : searchQuery;
            if (q) submitSearch(q);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const submitSearch = (query) => {
        setSearchQuery(query);
        setShowSuggestions(false);
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    useEffect(() => {
        const handleOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleOutside);
        return () => document.removeEventListener('mousedown', handleOutside);
    }, []);

    return (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Top bar */}
                <div className="flex items-center justify-between h-16 gap-4">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-md">
                            <Wrench className="w-5 h-5 text-white" />
                        </div>
                        <div className="hidden sm:block">
                            <p className="font-bold text-gray-900 dark:text-white text-lg leading-none">PartsBazaar</p>
                            <p className="text-xs text-blue-600 dark:text-blue-400 leading-none">Spare Parts Marketplace</p>
                        </div>
                    </Link>

                    {/* Search bar */}
                    <div className="flex-1 max-w-xl relative" ref={searchRef}>
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => handleSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
                                placeholder="Search: iPhone 11 Display, Redmi Note 8 Battery..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Suggestions dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden z-50">
                                {suggestions.map((s, i) => (
                                    <button
                                        key={i}
                                        onMouseDown={() => submitSearch(s)}
                                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors ${i === selectedIndex
                                                ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            }`}
                                    >
                                        <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                        {s}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-1 sm:gap-2">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            title="Toggle dark mode"
                        >
                            {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                        </button>

                        <Link to="/dashboard?tab=wishlist" className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <Heart className="w-4.5 h-4.5" />
                            {wishlist.length > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {wishlist.length}
                                </span>
                            )}
                        </Link>

                        <Link to="/cart" className="relative p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                            <ShoppingCart className="w-4.5 h-4.5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/dashboard"
                            className="hidden sm:flex btn-primary text-xs px-4 py-2"
                        >
                            My Account
                        </Link>

                        <Link
                            to="/admin"
                            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-200 dark:hover:bg-purple-900 transition-colors"
                        >
                            Admin
                        </Link>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="sm:hidden p-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        >
                            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* Category bar — from DB */}
                <nav className="hidden sm:flex items-center gap-1 pb-2 overflow-x-auto">
                    <Link
                        to="/search"
                        className="shrink-0 px-3 py-1 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-300 transition-colors whitespace-nowrap"
                    >
                        All Parts
                    </Link>
                    {categories.map(cat => (
                        <Link
                            key={cat._id}
                            to={`/search?category=${encodeURIComponent(cat.name)}`}
                            className="shrink-0 px-3 py-1 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-700 dark:hover:text-blue-300 transition-colors whitespace-nowrap"
                        >
                            {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                        </Link>
                    ))}
                    <Link
                        to="/search?rare=true"
                        className="shrink-0 px-3 py-1 rounded-lg text-xs font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950 transition-colors whitespace-nowrap"
                    >
                        ⚡ Rare Parts
                    </Link>
                </nav>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="sm:hidden pb-4 flex flex-col gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
                        <Link to="/dashboard" className="btn-primary justify-center">My Account</Link>
                        <Link to="/admin" className="btn-outline justify-center">Admin Dashboard</Link>
                        <div className="flex flex-wrap gap-2 mt-1">
                            <Link to="/search" className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                All Parts
                            </Link>
                            {categories.map(cat => (
                                <Link key={cat._id} to={`/search?category=${encodeURIComponent(cat.name)}`} className="px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                                    {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                                </Link>
                            ))}
                            <Link to="/search?rare=true" className="px-3 py-1 rounded-lg text-xs font-medium bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">
                                ⚡ Rare Parts
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
