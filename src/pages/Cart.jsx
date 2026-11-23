import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingState } from '../components/common/LoadingState';
import { formatRupiah } from '../config/constants';
import { Navbar } from '../components/common/Navbar';

export const Cart = () => {
  const navigate = useNavigate();
  const { items, summary, loading, updateQty, removeItem } = useCart();

  return (
    <div className="app-container">
      {/* Desktop Navbar */}
      <div className="desktop-only" style={{ width: '100%' }}>
        <Navbar />
      </div>

      {/* Top Header */}
      <div className="page-header-nav">
        <button onClick={() => navigate(-1)} className="icon-btn" aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <span className="page-header-title">Keranjang Belanja</span>
        <div style={{ width: '40px' }} />
      </div>

      <main className="page-content-standalone">
        {loading && items.length === 0 ? (
          <LoadingState message="Memuat item keranjang belanja..." />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Keranjang Masih Kosong"
            description="Belum ada kopi yang Anda pilih. Yuk temukan kopi terbaik pilihanmu sekarang!"
            actionText="Mulai Belanja Kopi"
            actionLink="/explore"
          />
        ) : (
          <div className="cart-grid-container">
            {/* Left Column: List of Cart Items */}
            <div className="cart-items-column">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {items.map((item) => {
                  const prod = item.products || {};
                  const itemPrice = Number(prod.price || 0);

                  return (
                    <div key={item.id} className="cart-item-card">
                      <img
                        src={prod.image_url || 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300'}
                        alt={prod.name}
                        className="cart-item-img"
                      />

                      <div className="cart-item-details">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <h4 className="cart-item-title">{prod.name}</h4>
                          <button
                            onClick={() => removeItem(item.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--text-muted)',
                              padding: '2px'
                            }}
                            aria-label="Hapus item"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                          <span className="cart-item-price">{formatRupiah(itemPrice)}</span>

                          <div className="qty-control">
                            <button
                              className="qty-btn"
                              onClick={() => updateQty(item.id, item.quantity - 1)}
                              aria-label="Kurangi kuantitas"
                            >
                              <Minus size={13} />
                            </button>
                            <span className="qty-val">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() => updateQty(item.id, item.quantity + 1)}
                              aria-label="Tambah kuantitas"
                            >
                              <Plus size={13} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Order Summary Box */}
            <div className="cart-summary-column">
              <div className="summary-box">
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '14px' }}>
                  Ringkasan Pembelian
                </h4>

                <div className="summary-row">
                  <span>Subtotal ({summary.total_items || items.reduce((s, i) => s + i.quantity, 0)} produk)</span>
                  <span>{formatRupiah(summary.subtotal)}</span>
                </div>

                <div className="summary-row">
                  <span>Estimasi Biaya Pengiriman</span>
                  <span>{formatRupiah(summary.estimated_shipping || 15000)}</span>
                </div>

                <div className="summary-row total">
                  <span>Total Pembayaran</span>
                  <span>{formatRupiah(summary.grand_total || (summary.subtotal + 15000))}</span>
                </div>

                {/* Desktop Checkout CTA Button */}
                <button
                  onClick={() => navigate('/checkout')}
                  className="btn btn-primary btn-block desktop-only"
                  style={{ marginTop: '20px', padding: '14px' }}
                >
                  <span>Lanjut ke Checkout</span>
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Sticky Bottom Checkout Bar (Mobile-only) */}
      {items.length > 0 && (
        <footer className="detail-bottom-bar mobile-only">
          <div style={{ flex: 1 }}>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Pembayaran</span>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              {formatRupiah(summary.grand_total || (summary.subtotal + 15000))}
            </span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="btn btn-primary"
            style={{ padding: '12px 24px' }}
          >
            <span>Lanjut Checkout</span>
            <ArrowRight size={16} />
          </button>
        </footer>
      )}
    </div>
  );
};
