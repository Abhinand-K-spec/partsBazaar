import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('wishlist') || '[]');
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }, [wishlist]);

    const toggleWishlist = (product) => {
        setWishlist(prev => {
            const exists = prev.find(i => i.id === product.id);
            if (exists) {
                toast('Removed from wishlist', { icon: '💔', id: `wl-${product.id}` });
                return prev.filter(i => i.id !== product.id);
            } else {
                toast.success(`Saved to wishlist — ${product.name}`, { icon: '❤️', id: `wl-${product.id}` });
                return [...prev, product];
            }
        });
    };

    const isWishlisted = (id) => wishlist.some(i => i.id === id);
    const removeFromWishlist = (id) => setWishlist(prev => prev.filter(i => i.id !== id));

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, removeFromWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
