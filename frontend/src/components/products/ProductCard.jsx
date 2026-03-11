import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Star, Zap, Shield } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

function StockBadge({ stock }) {
    if (stock === 0) return <span className="badge bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">Out of Stock</span>;
    if (stock <= 5) return <span className="badge bg-orange-100 dark:bg-orange-950 text-orange-600 dark:text-orange-400">Only {stock} left</span>;
    return <span className="badge bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400">In Stock</span>;
}

export default function ProductCard({ product, skeleton = false }) {
    const { addToCart } = useCart();
    const { toggleWishlist, isWishlisted } = useWishlist();

    if (skeleton) {
        return (
            <div className="card p-4 space-y-3">
                <div className="skeleton h-44 w-full rounded-xl" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-6 w-1/3 rounded" />
                <div className="skeleton h-9 w-full rounded-xl" />
            </div>
        );
    }

    const discount = product.originalPrice
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
        : 0;

    return (
        <div className="card p-0 overflow-hidden group flex flex-col">
            {/* Image */}
            <Link to={`/product/${product._id || product.id}`} className="relative block overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {product.isRare && (
                        <span className="badge bg-purple-600 text-white text-xs shadow-md">
                            <Zap className="w-3 h-3" /> Rare
                        </span>
                    )}
                    {product.isTrending && (
                        <span className="badge bg-orange-500 text-white text-xs shadow-md">
                            🔥 Trending
                        </span>
                    )}
                    {discount > 0 && (
                        <span className="badge bg-green-500 text-white text-xs shadow-md">
                            -{discount}%
                        </span>
                    )}
                </div>
                {/* Wishlist button */}
                <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
                    className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md ${isWishlisted(product.id)
                        ? 'bg-red-500 text-white'
                        : 'bg-white/90 dark:bg-gray-800/90 text-gray-400 hover:text-red-500'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${isWishlisted(product.id) ? 'fill-current' : ''}`} />
                </button>
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 gap-2">
                {/* Brand + part type */}
                <div className="flex items-center gap-2 text-xs">
                    <span className="badge bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {typeof product.brand === 'object' ? product.brand?.name : (product.brandName || product.brand)}
                    </span>
                    <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{product.partType}</span>
                </div>

                <Link to={`/product/${product._id || product.id}`}>
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                        {product.name}
                    </h3>
                </Link>

                {/* Compatibility */}
                <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-1">
                    📱 Fits: {Array.isArray(product.compatibleModels) ? product.compatibleModels.join(', ') : product.model}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1.5 text-xs">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < Math.floor(product.rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-700'}`} />
                        ))}
                    </div>
                    <span className="text-gray-500 dark:text-gray-400">{product.rating} ({product.numReviews ?? product.reviews ?? 0})</span>
                </div>

                {/* Stock */}
                <StockBadge stock={product.stock} />

                {/* Warranty */}
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Shield className="w-3.5 h-3.5 text-green-500" /> {product.warranty} warranty
                </div>

                <div className="mt-auto pt-2 flex items-center justify-between">
                    <div>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</p>
                        {product.originalPrice && (
                            <p className="text-xs text-gray-400 line-through">₹{product.originalPrice.toLocaleString()}</p>
                        )}
                    </div>

                    <button
                        disabled={product.stock === 0}
                        onClick={() => addToCart(product)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all active:scale-95 ${product.stock === 0
                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                            }`}
                    >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        {product.stock === 0 ? 'Sold Out' : 'Add'}
                    </button>
                </div>
            </div>
        </div>
    );
}
