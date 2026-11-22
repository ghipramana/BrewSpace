import axios from 'axios';
import { API_BASE_URL } from '../config/constants';
import { fallbackCategories, fallbackProducts } from './mockData';

// Inisialisasi Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 4000
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

// Interceptor response untuk penanganan error
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Gagal menghubungi server';
    return Promise.reject(new Error(message));
  }
);

// ==============================================================================
// SERVICE: PRODUK & KATEGORI (Dengan Fallback Cerdas jika Backend Belum Nyala)
// ==============================================================================

const getStoredProducts = () => {
  try {
    const stored = localStorage.getItem('brewspace_local_products');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [...fallbackProducts];
};

const saveStoredProducts = (products) => {
  localStorage.setItem('brewspace_local_products', JSON.stringify(products));
};

export const getCategories = async () => {
  try {
    const res = await apiClient.get('/categories');
    return res;
  } catch (err) {
    console.warn('[BrewSpace] Backend belum menyala di port 5000, menggunakan data lokal kategori:', err.message);
    return { success: true, data: fallbackCategories };
  }
};

export const getCategoryById = async (id) => {
  try {
    const res = await apiClient.get(`/categories/${id}`);
    return res;
  } catch (err) {
    const cat = fallbackCategories.find(c => c.id === parseInt(id, 10)) || fallbackCategories[0];
    return { success: true, data: cat };
  }
};

export const getProducts = async (params = {}) => {
  try {
    const res = await apiClient.get('/products', { params });
    return res;
  } catch (err) {
    console.warn('[BrewSpace] Backend belum menyala di port 5000, menggunakan data lokal produk:', err.message);
    let results = getStoredProducts();

    if (params.category_id) {
      results = results.filter(p => p.category_id === parseInt(params.category_id, 10));
    }
    if (params.is_best_seller) {
      results = results.filter(p => p.is_best_seller);
    }
    if (params.is_featured) {
      results = results.filter(p => p.is_featured);
    }
    if (params.search) {
      const q = params.search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(q) || (p.origin && p.origin.toLowerCase().includes(q))
      );
    }
    if (params.sort === 'price_asc') {
      results.sort((a, b) => a.price - b.price);
    } else if (params.sort === 'price_desc') {
      results.sort((a, b) => b.price - a.price);
    } else if (params.sort === 'rating_desc') {
      results.sort((a, b) => b.rating - a.rating);
    }
    if (params.limit) {
      results = results.slice(0, parseInt(params.limit, 10));
    }

    return { success: true, data: results };
  }
};

export const getProductById = async (id) => {
  try {
    const res = await apiClient.get(`/products/${id}`);
    return res;
  } catch (err) {
    console.warn('[BrewSpace] Backend belum menyala di port 5000, menggunakan data lokal detail produk');
    const products = getStoredProducts();
    const prod = products.find(p => p.id === id) || products[0];
    return { success: true, data: prod };
  }
};

/**
 * CREATE: Tambah produk kopi baru
 */
export const createProduct = async (productData) => {
  try {
    const res = await apiClient.post('/products', productData);
    // Sync ke local store juga
    const products = getStoredProducts();
    const created = res.data || { id: 'p-' + Date.now(), ...productData };
    products.unshift(created);
    saveStoredProducts(products);
    return res;
  } catch (err) {
    console.warn('[BrewSpace] Backend offline, menyimpan produk baru secara lokal:', err.message);
    const products = getStoredProducts();
    const cat = fallbackCategories.find(c => c.id === Number(productData.category_id)) || { id: 1, name: 'Biji Kopi', slug: 'biji-kopi' };
    const newProduct = {
      id: 'p-' + Date.now(),
      name: productData.name,
      category_id: Number(productData.category_id || 1),
      origin: productData.origin || 'Nusantara',
      roast_level: productData.roast_level || 'Medium',
      price: Number(productData.price || 0),
      stock: Number(productData.stock || 0),
      rating: 5.0,
      reviews_count: 0,
      description: productData.description || '',
      image_url: productData.image_url || 'https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&w=600&q=80',
      is_featured: Boolean(productData.is_featured),
      is_best_seller: Boolean(productData.is_best_seller),
      categories: cat,
      created_at: new Date().toISOString()
    };
    products.unshift(newProduct);
    saveStoredProducts(products);
    return { success: true, data: newProduct, message: 'Produk berhasil ditambahkan' };
  }
};

/**
 * UPDATE: Perbarui data produk
 */
export const updateProduct = async (id, updateData) => {
  try {
    const res = await apiClient.put(`/products/${id}`, updateData);
    // Sync ke local store
    const products = getStoredProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      products[idx] = { ...products[idx], ...updateData };
      saveStoredProducts(products);
    }
    return res;
  } catch (err) {
    console.warn('[BrewSpace] Backend offline, memperbarui produk secara lokal:', err.message);
    const products = getStoredProducts();
    const idx = products.findIndex(p => p.id === id);
    if (idx !== -1) {
      const cat = updateData.category_id
        ? fallbackCategories.find(c => c.id === Number(updateData.category_id))
        : products[idx].categories;
      products[idx] = {
        ...products[idx],
        ...updateData,
        price: updateData.price !== undefined ? Number(updateData.price) : products[idx].price,
        stock: updateData.stock !== undefined ? Number(updateData.stock) : products[idx].stock,
        categories: cat || products[idx].categories
      };
      saveStoredProducts(products);
      return { success: true, data: products[idx], message: 'Produk berhasil diperbarui' };
    }
    throw new Error('Produk dengan ID tersebut tidak ditemukan');
  }
};

/**
 * DELETE: Hapus produk
 */
export const deleteProduct = async (id) => {
  try {
    const res = await apiClient.delete(`/products/${id}`);
    let products = getStoredProducts();
    products = products.filter(p => p.id !== id);
    saveStoredProducts(products);
    return res;
  } catch (err) {
    console.warn('[BrewSpace] Backend offline, menghapus produk secara lokal:', err.message);
    let products = getStoredProducts();
    products = products.filter(p => p.id !== id);
    saveStoredProducts(products);
    return { success: true, message: 'Produk berhasil dihapus' };
  }
};

// ==============================================================================
// SERVICE: KERANJANG BELANJA (Dengan Fallback LocalStorage)
// ==============================================================================

const getLocalCart = () => {
  try {
    return JSON.parse(localStorage.getItem('brewspace_local_cart')) || [];
  } catch {
    return [];
  }
};

const saveLocalCart = (cart) => {
  localStorage.setItem('brewspace_local_cart', JSON.stringify(cart));
};

export const getCart = async () => {
  try {
    return await apiClient.get('/cart');
  } catch {
    const items = getLocalCart();
    const subtotal = items.reduce((sum, item) => sum + (item.products.price * item.quantity), 0);
    return {
      success: true,
      data: {
        items,
        summary: {
          total_items: items.reduce((s, i) => s + i.quantity, 0),
          subtotal,
          estimated_shipping: subtotal > 0 ? 15000 : 0,
          grand_total: subtotal > 0 ? subtotal + 15000 : 0
        }
      }
    };
  }
};

export const addToCart = async (productId, quantity = 1, grindOption = 'Biji Utuh') => {
  try {
    return await apiClient.post('/cart', { product_id: productId, quantity, grind_option: grindOption });
  } catch {
    const items = getLocalCart();
    const prod = fallbackProducts.find(p => p.id === productId) || fallbackProducts[0];
    const existing = items.find(i => i.product_id === productId && i.grind_option === grindOption);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: 'cart-' + Date.now(),
        product_id: productId,
        quantity,
        grind_option: grindOption,
        products: prod
      });
    }
    saveLocalCart(items);
    return { success: true };
  }
};

export const updateCartItem = async (cartItemId, quantity) => {
  try {
    return await apiClient.put(`/cart/${cartItemId}`, { quantity });
  } catch {
    let items = getLocalCart();
    if (quantity <= 0) {
      items = items.filter(i => i.id !== cartItemId);
    } else {
      const it = items.find(i => i.id === cartItemId);
      if (it) it.quantity = quantity;
    }
    saveLocalCart(items);
    return { success: true };
  }
};

export const removeCartItem = async (cartItemId) => {
  try {
    return await apiClient.delete(`/cart/${cartItemId}`);
  } catch {
    const items = getLocalCart().filter(i => i.id !== cartItemId);
    saveLocalCart(items);
    return { success: true };
  }
};

// ==============================================================================
// SERVICE: FAVORIT (Dengan Fallback LocalStorage)
// ==============================================================================

const getLocalFavs = () => {
  try {
    return JSON.parse(localStorage.getItem('brewspace_local_favs')) || [
      'a1111111-1111-1111-1111-111111111111',
      'd2222222-2222-2222-2222-222222222222'
    ];
  } catch {
    return [];
  }
};

export const getFavorites = async () => {
  try {
    return await apiClient.get('/favorites');
  } catch {
    const favIds = getLocalFavs();
    const prods = fallbackProducts.filter(p => favIds.includes(p.id));
    return {
      success: true,
      data: prods.map(p => ({ id: 'fav-' + p.id, product_id: p.id, products: p }))
    };
  }
};

export const addFavorite = async (productId) => {
  try {
    return await apiClient.post('/favorites', { product_id: productId });
  } catch {
    const favs = getLocalFavs();
    if (!favs.includes(productId)) {
      favs.push(productId);
      localStorage.setItem('brewspace_local_favs', JSON.stringify(favs));
    }
    return { success: true };
  }
};

export const removeFavorite = async (identifier) => {
  try {
    return await apiClient.delete(`/favorites/${identifier}`);
  } catch {
    let favs = getLocalFavs();
    favs = favs.filter(id => id !== identifier && ('fav-' + id) !== identifier);
    localStorage.setItem('brewspace_local_favs', JSON.stringify(favs));
    return { success: true };
  }
};

// ==============================================================================
// SERVICE: PESANAN (ORDERS)
// ==============================================================================

const getLocalOrders = () => {
  try {
    return JSON.parse(localStorage.getItem('brewspace_local_orders')) || [
      {
        id: 'ord-demo-01',
        order_number: 'BS-20261122-1082',
        total_amount: 100000,
        status: 'Diproses',
        shipping_address: 'Jl. Kampus Merdeka No. 12, Yogyakarta',
        shipping_phone: '081234567890',
        payment_method: 'QRIS (Simulasi)',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        order_items: [
          {
            id: 'oi-1',
            product_name: 'Arabica Aceh Gayo Specialty 250g',
            price: 85000,
            quantity: 1,
            grind_option: 'Biji Utuh',
            subtotal: 85000
          }
        ]
      }
    ];
  } catch {
    return [];
  }
};

export const getOrders = async () => {
  try {
    return await apiClient.get('/orders');
  } catch {
    return { success: true, data: getLocalOrders() };
  }
};

export const getOrderById = async (id) => {
  try {
    return await apiClient.get(`/orders/${id}`);
  } catch {
    const orders = getLocalOrders();
    const ord = orders.find(o => o.id === id) || orders[0];
    return { success: true, data: ord };
  }
};

export const checkoutOrder = async (payload) => {
  try {
    return await apiClient.post('/orders', payload);
  } catch {
    const orders = getLocalOrders();
    const cartItems = getLocalCart();
    const items = payload.items || cartItems.map(c => ({
      product_name: c.products.name,
      price: c.products.price,
      quantity: c.quantity,
      grind_option: c.grind_option,
      subtotal: c.products.price * c.quantity
    }));
    const totalAmount = items.reduce((s, i) => s + i.subtotal, 0) + 15000;
    const newOrder = {
      id: 'ord-' + Date.now(),
      order_number: 'BS-' + new Date().toISOString().slice(0, 10).replace(/-/g, '') + '-' + Math.floor(1000 + Math.random() * 9000),
      total_amount: totalAmount,
      status: 'Diproses',
      shipping_address: payload.shipping_address,
      shipping_phone: payload.shipping_phone,
      payment_method: payload.payment_method || 'QRIS (Simulasi)',
      notes: payload.notes || '',
      created_at: new Date().toISOString(),
      order_items: items
    };
    orders.unshift(newOrder);
    localStorage.setItem('brewspace_local_orders', JSON.stringify(orders));
    localStorage.removeItem('brewspace_local_cart');
    return { success: true, data: newOrder };
  }
};

// ==============================================================================
// SERVICE: USER PROFILE
// ==============================================================================

export const getUserProfile = async (userId) => {
  try {
    return await apiClient.get(`/users/${userId}`);
  } catch {
    const user = JSON.parse(localStorage.getItem('brewspace_user')) || {
      full_name: 'Penikmat Kopi Praktikum',
      email: 'mahasiswa@brewspace.ac.id',
      phone: '081234567890',
      address: 'Jl. Kampus Merdeka No. 12, Sleman, Yogyakarta'
    };
    return { success: true, data: user };
  }
};

export const updateUserProfile = async (userId, payload) => {
  try {
    return await apiClient.put(`/users/${userId}`, payload);
  } catch {
    const user = JSON.parse(localStorage.getItem('brewspace_user')) || {};
    const updated = { ...user, ...payload };
    localStorage.setItem('brewspace_user', JSON.stringify(updated));
    return { success: true, data: updated };
  }
};

export default apiClient;
