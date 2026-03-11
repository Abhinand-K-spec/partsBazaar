import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Star, Shield, Truck, ShoppingCart, Heart, Share2, ChevronLeft,
    Zap, CheckCircle, Clock, Package, ChevronRight, ZoomIn
} from 'lucide-react';
import { apiGetProduct, apiGetProducts } from '../data/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/products/ProductCard';

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5001/api').replace('/api', '');
const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/800x800?text=No+Image';
    if (img.startsWith('http')) return img;
    return `${API_BASE}${img}`;
};

export default function ProductDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();
    const [selectedImg, setSelectedImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [added, setAdded] = useState(false);
    const [activeTab, setActiveTab] = useState('description');
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [loadingProduct, setLoadingProduct] = useState(true);

    useEffect(() => {
        setLoadingProduct(true);
        setSelectedImg(0); setQty(1); setAdded(false);
        apiGetProduct(id)
            .then(res => {
                const p = res.data.product;
                setProduct(p);
                if (p?.categoryName) {
                    apiGetProducts({ q: p.categoryName, limit: 5 })
                        .then(r => setRelated((r.data.products || []).filter(x => x._id !== p._id).slice(0, 4)))
                        .catch(() => {});
                }
            })
            .catch(() => setProduct(null))
            .finally(() => setLoadingProduct(false));
    }, [id]);

    if (loadingProduct) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 gap-4">
                <div className="w-12 h-12 rounded-full border-4 border-blue-600/30 border-t-blue-600 animate-spin" />
                <p className="text-gray-400">Loading product...</p>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-96 gap-4">
                <p className="text-5xl">😕</p>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Product not found</h2>
                <Link to="/search" className="btn-primary">Browse All Parts</Link>
            </div>
        );
    }

    const handleAddToCart = () => {
        addToCart(product, qty);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    // Safely build image list — empty [] is truthy so must check length
    const mainImg = product.image ? getImageUrl(product.image) : null;
    const extraImgs = (product.images || []).filter(Boolean).map(getImageUrl);
    const allImages = extraImgs.length > 0 ? extraImgs : (mainImg ? [mainImg] : []);
    const displayImage = allImages[selectedImg] || mainImg || 'https://placehold.co/800x800?text=No+Image';

    const mockReviews = [
        { id: 1, user: 'Ravi K.', rating: 5, date: '2 days ago', comment: 'Excellent quality! Exact fit for the model. Display works perfectly.' },
        { id: 2, user: 'Anita M.', rating: 4, date: '1 week ago', comment: 'Good product. Fast shipping. Minor packaging issue but part is fine.' },
        { id: 3, user: 'Suresh P.', rating: 5, date: '2 weeks ago', comment: 'I run a repair shop — this is now my go-to supplier. Genuine parts!' },
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                <Link to="/" className="hover:text-blue-600">Home</Link>
                <ChevronRight className="w-3 h-3" />
                <Link to="/search" className="hover:text-blue-600">Search</Link>
                <ChevronRight className="w-3 h-3" />
                <span className="text-gray-600 dark:text-gray-300 line-clamp-1">{product.name}</span>
            </nav>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
                {/* Gallery */}
                <div className="space-y-4">
                    <div className="relative overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 aspect-square group">
                        <img
                            src={displayImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        {/* Badges */}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {product.isRare && (
                                <span className="badge bg-purple-600 text-white shadow-lg">
                                    <Zap className="w-3.5 h-3.5" /> Rare Part
                                </span>
                            )}
                            {discount > 0 && (
                                <span className="badge bg-green-500 text-white shadow-lg">-{discount}% OFF</span>
                            )}
                        </div>
                        <div className="absolute top-4 right-4">
                            <button className="w-10 h-10 rounded-full bg-white/90 dark:bg-gray-800/90 flex items-center justify-center shadow-md text-gray-600 dark:text-gray-300">
                                <ZoomIn className="w-4.5 h-4.5" />
                            </button>
                        </div>
                    </div>

                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                        <div className="flex gap-3">
                            {allImages.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedImg(i)}
                                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${selectedImg === i ? 'border-blue-600 shadow-md' : 'border-transparent hover:border-gray-300'
                                        }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Product info */}
                <div className="space-y-5">
                    {/* Brand + wishlist */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                            <span className="badge bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-sm">{product.brandName || (typeof product.brand === 'string' ? product.brand : '')}</span>
                            <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-sm">{product.categoryName || product.partType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => toggleWishlist(product)}
                                className={`p-2.5 rounded-xl border transition-all ${isWishlisted(product.id)
                                        ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-500'
                                        : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isWishlisted(product.id) ? 'fill-red-500' : ''}`} />
                            </button>
                            <button className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-blue-600 transition-all">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">{product.name}</h1>
                        <p className="text-sm text-gray-400 mt-1">SKU: {product.sku}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4.5 h-4.5 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 dark:text-gray-700'}`} />
                            ))}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">{product.rating}</span>
                        <span className="text-gray-400 text-sm">({product.reviews} reviews)</span>
                    </div>

                    {/* Price */}
                    <div className="flex items-end gap-3">
                        <span className="text-4xl font-extrabold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</span>
                        {product.originalPrice && (
                            <>
                                <span className="text-xl text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</span>
                                <span className="badge bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-300 text-sm">Save ₹{(product.originalPrice - product.price).toLocaleString()}</span>
                            </>
                        )}
                    </div>

                    {/* Stock */}
                    {product.stock === 0 ? (
                        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-red-500" /> Out of Stock
                        </div>
                    ) : product.stock <= 5 ? (
                        <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> Only {product.stock} left in stock!
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-semibold">
                            <span className="w-2 h-2 rounded-full bg-green-500" /> In Stock ({product.stock} units)
                        </div>
                    )}

                    {/* Trust badges */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { icon: Shield, label: `${product.warranty} Warranty`, color: 'text-green-600 dark:text-green-400' },
                            { icon: Truck, label: `Ships in ${product.shippingDays}d`, color: 'text-blue-600 dark:text-blue-400' },
                            { icon: Package, label: 'Secure Packing', color: 'text-orange-600 dark:text-orange-400' },
                        ].map(({ icon: Icon, label, color }) => (
                            <div key={label} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-center">
                                <Icon className={`w-5 h-5 ${color}`} />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Compatible models */}
                    <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900">
                        <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">📱 Compatible Models</p>
                        <div className="flex flex-wrap gap-2">
                            {product.compatibleModels.map(m => (
                                <span key={m} className="badge bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-blue-200 dark:border-blue-800">{m}</span>
                            ))}
                        </div>
                    </div>

                    {/* Quantity + Add to cart */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-0 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-lg">−</button>
                            <span className="px-4 py-3 font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center">{qty}</span>
                            <button onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))} className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-bold text-lg">+</button>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-base transition-all active:scale-95 ${added
                                    ? 'bg-green-600 text-white shadow-lg'
                                    : product.stock === 0
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                        : 'btn-primary text-base py-3.5 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {added ? <><CheckCircle className="w-5 h-5" /> Added!</> : <><ShoppingCart className="w-5 h-5" /> Add to Cart</>}
                        </button>
                    </div>

                    <button
                        onClick={() => { addToCart(product, qty); navigate('/checkout'); }}
                        disabled={product.stock === 0}
                        className="w-full btn-accent justify-center py-3.5 text-base shadow-lg hover:shadow-xl"
                    >
                        Buy Now — ₹{(product.price * qty).toLocaleString()}
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800 mb-8">
                <div className="flex gap-6">
                    {[
                        { key: 'description', label: 'Description' },
                        { key: 'specs', label: 'Specifications' },
                        { key: 'reviews', label: `Reviews (${product.reviews})` },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.key
                                    ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {activeTab === 'description' && (
                <div className="max-w-3xl text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-12">
                    <p className="mb-4">{product.description}</p>
                    <ul className="space-y-2 mt-4">
                        {['OEM quality part', 'Fully tested before shipping', 'Packed securely to prevent damage', 'GST invoice provided', 'Easy return within 7 days if defective'].map(f => (
                            <li key={f} className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> {f}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {activeTab === 'specs' && (
                <div className="max-w-xl mb-12">
                    <div className="card overflow-hidden">
                        {Object.entries(product.specifications).map(([key, val], i) => (
                            <div key={key} className={`flex items-center justify-between px-5 py-3.5 text-sm ${i % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}>
                                <span className="font-medium text-gray-700 dark:text-gray-300">{key}</span>
                                <span className="text-gray-600 dark:text-gray-400">{val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'reviews' && (
                <div className="max-w-3xl mb-12 space-y-4">
                    {mockReviews.map(r => (
                        <div key={r.id} className="card p-5">
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{r.user}</p>
                                    <p className="text-xs text-gray-400">{r.date}</p>
                                </div>
                                <div className="flex items-center gap-0.5">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{r.comment}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Related parts */}
            {related.length > 0 && (
                <section>
                    <h2 className="section-title mb-6">Similar Spare Parts</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {related.map(p => <ProductCard key={p.id} product={p} />)}
                    </div>
                </section>
            )}

            {/* Sticky bar (mobile) */}
            <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden glass border-t border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center gap-3">
                <div>
                    <p className="font-extrabold text-gray-900 dark:text-white text-lg">₹{product.price.toLocaleString()}</p>
                    {product.originalPrice && <p className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</p>}
                </div>
                <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="flex-1 btn-primary justify-center py-3"
                >
                    <ShoppingCart className="w-4 h-4" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                    onClick={() => { addToCart(product); navigate('/checkout'); }}
                    disabled={product.stock === 0}
                    className="flex-1 btn-accent justify-center py-3"
                >
                    Buy Now
                </button>
            </div>
            <div className="h-20 lg:hidden" /> {/* Spacer for sticky bar */}
        </div>
    );
}
