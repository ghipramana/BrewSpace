import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Inisialisasi Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Interceptor untuk menambahkan Bearer Token otomatis pada setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('brewspace_token') || 'demo-token-for-testing';
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor response untuk penanganan error umum
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Gagal menghubungi server';
    return Promise.reject(new Error(message));
  }
);

// Service API Produk & Kategori
export const getCategories = () => apiClient.get('/categories');
export const getCategoryById = (id) => apiClient.get(`/categories/${id}`);

export const getProducts = (params = {}) => apiClient.get('/products', { params });
export const getProductById = (id) => apiClient.get(`/products/${id}`);

// Service API Keranjang Belanja
export const getCart = () => apiClient.get('/cart');
export const addToCart = (productId, quantity = 1, grindOption = 'Biji Utuh') =>
  apiClient.post('/cart', { product_id: productId, quantity, grind_option: grindOption });
export const updateCartItem = (cartItemId, quantity) =>
  apiClient.put(`/cart/${cartItemId}`, { quantity });
export const removeCartItem = (cartItemId) =>
  apiClient.delete(`/cart/${cartItemId}`);

// Service API Favorit
export const getFavorites = () => apiClient.get('/favorites');
export const addFavorite = (productId) =>
  apiClient.post('/favorites', { product_id: productId });
export const removeFavorite = (identifier) =>
  apiClient.delete(`/favorites/${identifier}`);

// Service API Pesanan (Orders)
export const getOrders = () => apiClient.get('/orders');
export const getOrderById = (id) => apiClient.get(`/orders/${id}`);
export const checkoutOrder = (payload) => apiClient.post('/orders', payload);

// Service API User
export const getUserProfile = (userId) => apiClient.get(`/users/${userId}`);
export const updateUserProfile = (userId, payload) => apiClient.put(`/users/${userId}`, payload);

export default apiClient;
