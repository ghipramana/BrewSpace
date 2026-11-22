import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Phone, CreditCard, ShieldCheck, 
  WifiOff, CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { checkoutOrder } from '../services/api';
import { formatRupiah, PAYMENT_METHODS } from '../config/constants';

export const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, summary, refreshCart } = useCart();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();

  // Cek apakah direct checkout (Beli Sekarang)
  const directItem = location.state?.directItem;

  const items = directItem
    ? [directItem]
    : cartItems.map(c => ({
        product_id: c.product_id,
        product_name: c.products?.name || 'Kopi Pilihan',
        price: Number(c.products?.price || 0),
        quantity: c.quantity,
        grind_option: c.grind_option
      }));

  const subtotal = directItem
    ? directItem.price * directItem.quantity
    : summary.subtotal;

  const shippingCost = 15000;
  const grandTotal = subtotal + shippingCost;

  // Form states
  const [shippingAddress, setShippingAddress] = useState('Jl. Kampus Merdeka No. 12, Sleman, D.I. Yogyakarta 55281');
  const [shippingPhone, setShippingPhone] = useState('081234567890');
  const [paymentMethod, setPaymentMethod] = useState('QRIS (Simulasi)');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!isOnline) {
      alert('Anda sedang offline! Transaksi membutuhkan koneksi internet untuk konfirmasi ke server.');
      return;
    }

    if (!shippingAddress.trim() || !shippingPhone.trim()) {
      setErrorMsg('Alamat pengiriman dan nomor telepon wajib diisi lengkap.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const payload = {
        shipping_address: shippingAddress,
        shipping_phone: shippingPhone,
        payment_method: paymentMethod,
        notes: notes.trim(),
        items: directItem ? [directItem] : undefined
      };

      const res = await checkoutOrder(payload);

      if (res.success && res.data) {
        // Refresh keranjang di background jika checkout dari cart
        if (!directItem) refreshCart();
        // Arahkan ke detail order baru
        navigate(`/orders/${res.data.id}`, {
          state: { isNewOrder: true }
        });
      }
    } catch (err) {
      console.error('Error checkout:', err);
      setErrorMsg(err.message || 'Gagal memproses pesanan. Silakan coba kembali.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <div className="page-header-nav">
        <button onClick={() => navigate(-1)} className="icon-btn" aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <span className="page-header-title">Checkout Pesanan</span>
        <div style={{ width: '40px' }} />
      </div>

      <main className="page-content-standalone" style={{ padding: '16px 18px 120px 18px' }}>
        {/* PWA Offline Guard Banner */}
        {!isOnline && (
          <div style={{
            backgroundColor: '#FFEBEE',
            border: '1.5px solid #EF5350',
            borderRadius: 'var(--radius-md)',
            padding: '14px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px'
          }}>
            <WifiOff size={22} color="#D32F2F" style={{ marginTop: '2px', flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '0.86rem', color: '#D32F2F', display: 'block' }}>
                Koneksi Internet Terputus (Mode Offline)
              </strong>
              <span style={{ fontSize: '0.78rem', color: '#B71C1C', lineHeight: 1.4, display: 'block', marginTop: '2px' }}>
                Penyelesaian pesanan membutuhkan koneksi ke server. Tombol checkout dinonaktifkan hingga perangkat kembali terhubung online.
              </span>
            </div>
          </div>
        )}

        {errorMsg && (
          <div style={{
            backgroundColor: '#FFF3E0',
            border: '1px solid #FFE0B2',
            color: '#E65100',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            marginBottom: '14px'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmitOrder}>
          {/* Section: Alamat Pengiriman */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            border: '1px solid var(--border-light)',
            marginBottom: '14px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <MapPin size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--primary)' }}>
                Tujuan Pengiriman
              </h3>
            </div>

            <div className="form-group">
              <label className="form-label">Nomor Telepon Penerima</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Contoh: 081234567890"
                value={shippingPhone}
                onChange={(e) => setShippingPhone(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Alamat Lengkap</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan, kota..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Section: Catatan Pesanan */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            border: '1px solid var(--border-light)',
            marginBottom: '14px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Catatan untuk Barista (Opsional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Tolong packing kayu / jangan terlalu manis"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {/* Section: Metode Pembayaran (Simulasi) */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            border: '1px solid var(--border-light)',
            marginBottom: '14px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CreditCard size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--primary)' }}>
                Metode Pembayaran (Simulasi)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: paymentMethod === pm.id ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                    backgroundColor: paymentMethod === pm.id ? 'var(--surface-subtle)' : 'transparent',
                    cursor: 'pointer'
                  }}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value={pm.id}
                    checked={paymentMethod === pm.id}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  />
                  <div>
                    <strong style={{ fontSize: '0.84rem', color: 'var(--text-main)', display: 'block' }}>
                      {pm.name}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {pm.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Section: Ringkasan Item Pesanan */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px',
            border: '1px solid var(--border-light)',
            marginBottom: '14px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <h3 style={{ fontSize: '0.94rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '10px' }}>
              Rincian Item ({items.length} jenis)
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.product_name}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>
                      {item.quantity}x • {item.grind_option || 'Biji Utuh'}
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {formatRupiah(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px dashed var(--border-light)', marginTop: '12px', paddingTop: '10px' }}>
              <div className="summary-row">
                <span>Subtotal Kopi</span>
                <span>{formatRupiah(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Ongkos Kirim</span>
                <span>{formatRupiah(shippingCost)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Tagihan</span>
                <span>{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Confirmation Bar */}
          <footer className="detail-bottom-bar">
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block' }}>Total Pembayaran</span>
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                {formatRupiah(grandTotal)}
              </span>
            </div>

            <button
              type="submit"
              disabled={submitting || !isOnline}
              className="btn btn-primary"
              style={{ padding: '12px 24px' }}
            >
              {submitting ? 'Memproses...' : !isOnline ? 'Offline' : 'Bayar Sekarang'}
            </button>
          </footer>
        </form>
      </main>
    </div>
  );
};
