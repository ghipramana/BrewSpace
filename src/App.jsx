import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { OfflineBadge } from './components/common/OfflineBadge';
import { LoadingState } from './components/common/LoadingState';

// Halaman-halaman
import { Home } from './pages/Home';
import { Explore } from './pages/Explore';
import { Favorites } from './pages/Favorites';
import { Orders } from './pages/Orders';
import { Profile } from './pages/Profile';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { OrderDetail } from './pages/OrderDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminProducts } from './pages/AdminProducts';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminOrders } from './pages/AdminOrders';
import { AdminCustomers } from './pages/AdminCustomers';
import { AdminAccount } from './pages/AdminAccount';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, loading, isAdmin, adminLoading } = useAuth();

  if (loading || (adminOnly && adminLoading)) {
    return <LoadingState message="Memeriksa akses akun..." />;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
};

const CustomerOnlyRoute = ({ children }) => {
  const { isAdmin, isAuthenticated, loading, adminLoading } = useAuth();
  if (loading || (isAuthenticated && adminLoading)) {
    return <LoadingState message="Memeriksa akses akun..." />;
  }
  if (isAdmin) return <Navigate to="/admin" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          {/* Banner Indikator Mode Offline PWA */}
          <OfflineBadge />

          <Routes>
            {/* 5 Halaman Utama dengan Bottom Navigation */}
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute adminOnly><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/products" element={<ProtectedRoute adminOnly><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/orders" element={<ProtectedRoute adminOnly><AdminOrders /></ProtectedRoute>} />
            <Route path="/admin/customers" element={<ProtectedRoute adminOnly><AdminCustomers /></ProtectedRoute>} />
            <Route path="/admin/account" element={<ProtectedRoute adminOnly><AdminAccount /></ProtectedRoute>} />

            {/* Halaman Transaksi & Detail Produk (Standalone Page) */}
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CustomerOnlyRoute><Cart /></CustomerOnlyRoute>} />
            <Route path="/checkout" element={<CustomerOnlyRoute><Checkout /></CustomerOnlyRoute>} />
            <Route path="/orders/:id" element={<CustomerOnlyRoute><OrderDetail /></CustomerOnlyRoute>} />

            {/* Halaman Autentikasi */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Fallback rute tidak dikenal */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
