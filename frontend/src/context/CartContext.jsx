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
            const existing = prev.find(i => i.id === product.id);
            if (existing) {
                toast.success(`Qty updated — ${product.name}`, { id: `cart-${product.id}` });
                return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + quantity } : i);
            }
            toast.success(`Added to cart — ${product.name}`, { id: `cart-${product.id}` });
            return [...prev, { ...product, quantity }];
        });
    };

    const removeFromCart = (id) => {
        setCartItems(prev => {
            const item = prev.find(i => i.id === id);
            if (item) toast('Removed from cart', { icon: '🗑️', id: `rm-${id}` });
            return prev.filter(i => i.id !== id);
        });
    };

    const updateQuantity = (id, quantity) => {
        if (quantity <= 0) return removeFromCart(id);
        setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
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
