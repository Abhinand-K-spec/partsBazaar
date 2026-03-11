import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LoginPage from './pages/LoginPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 3200,
                  style: {
                    borderRadius: '12px',
                    fontSize: '13.5px',
                    fontWeight: '500',
                    padding: '12px 16px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
                    maxWidth: '360px',
                  },
                  success: {
                    style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' },
                    iconTheme: { primary: '#16a34a', secondary: '#f0fdf4' },
                  },
                  error: {
                    style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' },
                    iconTheme: { primary: '#dc2626', secondary: '#fef2f2' },
                  },
                }}
              />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<HomePage />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="product/:id" element={<ProductDetailPage />} />
                  <Route path="cart" element={<CartPage />} />
                  <Route path="checkout" element={<CheckoutPage />} />
                  <Route path="dashboard" element={<UserDashboard />} />
                  <Route path="login" element={<LoginPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
                <Route path="/admin" element={<AdminDashboard />} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
