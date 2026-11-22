import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    total_items: 0,
    subtotal: 0,
    estimated_shipping: 15000,
    grand_total: 0
  });
  const [loading, setLoading] = useState(false);

  // Ambil data keranjang dari backend
  const refreshCart = useCallback(async () => {
    if (!user) {
      setItems([]);
      setSummary({ total_items: 0, subtotal: 0, estimated_shipping: 0, grand_total: 0 });
      return;
    }

    try {
      setLoading(true);
      const res = await getCart();
      if (res.success && res.data) {
        setItems(res.data.items || []);
        setSummary(res.data.summary || {});
      }
    } catch (err) {
      console.warn('Gagal memuat keranjang via API, menggunakan keranjang lokal:', err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // Tambah item ke keranjang
  const addItem = async (productId, quantity = 1, grindOption = 'Biji Utuh') => {
    try {
      await addToCart(productId, quantity, grindOption);
      await refreshCart();
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    }
  };

  // Update kuantitas item
  const updateQty = async (cartItemId, quantity) => {
    try {
      await updateCartItem(cartItemId, quantity);
      await refreshCart();
    } catch (err) {
      console.error('Error updating cart qty:', err);
      throw err;
    }
  };

  // Hapus item dari keranjang
  const removeItem = async (cartItemId) => {
    try {
      await removeCartItem(cartItemId);
      await refreshCart();
    } catch (err) {
      console.error('Error removing cart item:', err);
      throw err;
    }
  };

  return (
    <CartContext.Provider value={{
      items,
      summary,
      loading,
      refreshCart,
      addItem,
      updateQty,
      removeItem,
      itemCount: summary.total_items || items.reduce((sum, i) => sum + i.quantity, 0)
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
