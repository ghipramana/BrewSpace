import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Coffee, Package, PackagePlus, RefreshCw, Tags, TriangleAlert } from 'lucide-react';
import { formatRupiah } from '../config/constants';
import { getCategories, getProducts } from '../services/api';
import { AdminSidebar } from '../components/common/AdminSidebar';
import './AdminDashboard.css';

export const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [productResult, categoryResult] = await Promise.all([getProducts(), getCategories()]);
      setProducts(productResult.data || []);
      setCategories(categoryResult.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat ringkasan admin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  const lowStockProducts = products.filter((product) => Number(product.stock || 0) > 0 && Number(product.stock || 0) <= 5);
  const outOfStockProducts = products.filter((product) => Number(product.stock || 0) === 0);
  const recentProducts = products.slice(0, 5);

  return (
    <div className="admin-dashboard-shell">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-topbar">
          <div><span className="admin-topbar-eyebrow">BREWSPACE MANAGEMENT</span><strong>Dashboard Admin</strong></div>
        </header>

        <div className="admin-content">
          <section className="admin-welcome-panel">
            <div>
              <span className="admin-welcome-tag">AREA KHUSUS ADMIN</span>
              <h1>Selamat datang di panel admin</h1>
              <p>Kelola katalog BrewSpace dan pantau ketersediaan produk dari satu tempat.</p>
            </div>
            <Link to="/admin/products" className="admin-primary-action"><PackagePlus size={18} /> Tambah Produk</Link>
          </section>

          {error && (
            <div className="admin-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={loadDashboard}><RefreshCw size={15} /> Coba lagi</button>
            </div>
          )}

          <section className="admin-stat-grid" aria-label="Ringkasan katalog">
            <article className="admin-stat-card">
              <span className="admin-stat-icon coffee"><Package size={20} /></span>
              <span className="admin-stat-label">Total produk</span>
              <strong>{loading ? '—' : products.length}</strong>
              <small>Produk di katalog</small>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-icon categories"><Tags size={20} /></span>
              <span className="admin-stat-label">Kategori kopi</span>
              <strong>{loading ? '—' : categories.length}</strong>
              <small>Kategori aktif</small>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-icon warning"><TriangleAlert size={20} /></span>
              <span className="admin-stat-label">Stok menipis</span>
              <strong>{loading ? '—' : lowStockProducts.length}</strong>
              <small>Stok 1–5 produk</small>
            </article>
            <article className="admin-stat-card">
              <span className="admin-stat-icon empty"><Package size={20} /></span>
              <span className="admin-stat-label">Stok habis</span>
              <strong>{loading ? '—' : outOfStockProducts.length}</strong>
              <small>Perlu diperbarui</small>
            </article>
          </section>

          <section className="admin-recent-panel">
            <div className="admin-section-heading">
              <div><span>INVENTARIS</span><h2>Produk di katalog</h2></div>
              <div className="admin-section-actions">
                <button type="button" className="admin-refresh-link" onClick={loadDashboard} disabled={loading}>
                  <RefreshCw size={15} className={loading ? 'spinning' : ''} /> Segarkan
                </button>
                <Link to="/admin/products" className="admin-text-link">Kelola semua <ArrowRight size={16} /></Link>
              </div>
            </div>

            {loading ? (
              <div className="admin-empty-state">Memuat data katalog…</div>
            ) : recentProducts.length === 0 ? (
              <div className="admin-empty-state">Belum ada produk. Tambahkan produk pertama untuk mulai mengisi katalog.</div>
            ) : (
              <div className="admin-product-list">
                {recentProducts.map((product) => (
                  <article className="admin-product-row" key={product.id}>
                    <img src={product.image_url} alt="" />
                    <div className="admin-product-info">
                      <strong>{product.name}</strong>
                      <span>{product.categories?.name || 'Kopi'} · {formatRupiah(product.price)}</span>
                    </div>
                    <span className={`admin-stock-pill ${Number(product.stock || 0) <= 5 ? 'low' : ''}`}>
                      Stok {product.stock ?? 0}
                    </span>
                    <Link to="/admin/products" className="admin-edit-link" aria-label={`Edit ${product.name}`}><ArrowRight size={17} /></Link>
                  </article>
                ))}
              </div>
            )}
          </section>

          <Link to="/admin/products" className="admin-mobile-manage"><Coffee size={17} /> Buka pengelolaan produk <ArrowRight size={17} /></Link>
        </div>
      </main>
    </div>
  );
};
