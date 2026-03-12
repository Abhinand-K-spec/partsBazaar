import axios from 'axios';

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: handle 401
API.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return Promise.reject(err);
    }
);

// ─── Auth ────────────────────────────────────────
export const apiLogin = (data) => API.post('/auth/login', data);
export const apiRegister = (data) => API.post('/auth/register', data);
export const apiGetMe = () => API.get('/auth/me');
export const apiUpdateProfile = (data) => API.put('/auth/profile', data);
export const apiAddAddress = (data) => API.post('/auth/addresses', data);
export const apiDeleteAddress = (id) => API.delete(`/auth/addresses/${id}`);

// ─── Products ────────────────────────────────────
export const apiGetProducts = (params) => API.get('/products', { params });
export const apiGetTrendingProducts = () => API.get('/products/trending');
export const apiGetRareProducts = () => API.get('/products/rare');
export const apiGetProduct = (id) => API.get(`/products/${id}`);
export const apiValidateCart = (items) => API.post('/products/validate-cart', { items });
export const apiCreateProduct = (data) => API.post('/products', data);
export const apiUpdateProduct = (id, data) => API.put(`/products/${id}`, data);
export const apiDeleteProduct = (id) => API.delete(`/products/${id}`);

// ─── Categories ──────────────────────────────────
export const apiGetCategories = () => API.get('/categories');
export const apiCreateCategory = (data) => API.post('/categories', data);
export const apiUpdateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const apiDeleteCategory = (id) => API.delete(`/categories/${id}`);


// ─── Brands ──────────────────────────────────────
export const apiGetBrands = () => API.get('/brands');
export const apiCreateBrand = (data) => API.post('/brands', data);
export const apiUpdateBrand = (id, data) => API.put(`/brands/${id}`, data);
export const apiDeleteBrand = (id) => API.delete(`/brands/${id}`);

// ─── Upload ──────────────────────────────────────
export const apiUploadImage = (formData) => API.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
});

// ─── Orders ──────────────────────────────────────
export const apiCreateOrder = (data) => API.post('/orders', data);
export const apiVerifyPayment = (data) => API.post('/orders/verify', data);
export const apiGetMyOrders = () => API.get('/orders/mine');
export const apiGetAllOrders = (params) => API.get('/orders', { params });
export const apiGetOrderStats = () => API.get('/orders/stats');
export const apiUpdateOrderStatus = (id, status) => API.put(`/orders/${id}/status`, { status });
export const apiGetOrder = (id) => API.get(`/orders/${id}`);

// ─── Users (Admin) ───────────────────────────────
export const apiGetUsers = (params) => API.get('/users', { params });
export const apiDeleteUser = (id) => API.delete(`/users/${id}`);
export const apiUpdateUser = (id, data) => API.put(`/users/${id}`, data);

export default API;
