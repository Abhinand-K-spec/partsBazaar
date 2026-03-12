import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch { return []; }
    });

    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product, quantity = 1) => {
        setCartItems(prev => {
            const productId = product._id || product.id;
            const existing = prev.find(i => (i._id || i.id) === productId);
            
            if (existing) {
                const newQty = existing.quantity + quantity;
                if (newQty > (product.stock || 99)) {
                    toast.error(`Only ${product.stock} available in stock!`, { id: `err-${productId}` });
                    return prev; // Do not update
                }
                toast.success(`Qty updated — ${product.name}`, { id: `cart-${productId}` });
                return prev.map(i => (i._id || i.id) === productId ? { ...i, quantity: newQty } : i);
            }

            if (quantity > (product.stock || 99)) {
                toast.error(`Only ${product.stock} available in stock!`, { id: `err-${productId}` });
                return prev;
            }

            toast.success(`Added to cart — ${product.name}`, { id: `cart-${productId}` });
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => {
            const item = prev.find(i => (i._id || i.id) === id);
            if (item) toast('Removed from cart', { icon: '🗑️', id: `rm-${id}` });
            return prev.filter(i => (i._id || i.id) !== id);
        });
    };

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) return removeFromCart(id);
        
        setCartItems(prev => prev.map(i => {
            if ((i._id || i.id) === id) {
                if (quantity > (i.stock || 99)) {
                    toast.error(`Only ${i.stock} available in stock!`, { id: `err-${id}` });
                    return i;
                }
                return { ...i, quantity };
            }
            return i;
        }));
    };

    const clearCart = () => setCartItems([]);

    const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
    const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);
