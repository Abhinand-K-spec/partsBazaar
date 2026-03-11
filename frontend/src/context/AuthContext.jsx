import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';
import { apiLogin, apiRegister } from '../data/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const saveAuth = (token, userData) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        const tid = toast.loading('Signing in...');
        try {
            const { data } = await apiLogin({ email, password });
            saveAuth(data.token, data.user);
            toast.success(`Welcome back, ${data.user.name}! 👋`, { id: tid });
            return data.user;
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Check your credentials.';
            setError(msg);
            toast.error(msg, { id: tid });
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const register = async (formData) => {
        setLoading(true);
        setError(null);
        const tid = toast.loading('Creating your account...');
        try {
            const { data } = await apiRegister(formData);
            saveAuth(data.token, data.user);
            toast.success(`Account created! Welcome, ${data.user.name} 🎉`, { id: tid });
            return data.user;
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please try again.';
            setError(msg);
            toast.error(msg, { id: tid });
            throw new Error(msg);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout, isAdmin }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};

export default AuthContext;
