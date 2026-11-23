import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowLeft, CheckCircle, Package, Calendar, 
  MapPin, Phone, CreditCard, Coffee, Clock 
} from 'lucide-react';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { getOrderById } from '../services/api';
import { formatRupiah, formatDate } from '../config/constants';
import { Navbar } from '../components/common/Navbar';

export const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNewOrder = location.state?.isNewOrder;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getOrderById(id);
        if (res.success && res.data) {
          setOrder(res.data);
        } else {
          setError('Data pesanan tidak ditemukan');
        }
      } catch (err) {
        console.error('Error fetching order detail:', err);
        setError(err.message || 'Gagal memuat rincian pesanan');
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="app-container">
        <LoadingState message="Mengambil rincian transaksi Anda..." />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="app-container">
        <div className="page-header-nav">
          <button onClick={() => navigate('/orders')} className="icon-btn" aria-label="Kembali">
            <ArrowLeft size={20} />
          </button>
          <span className="page-header-title">Detail Pesanan</span>
          <div style={{ width: '40px' }} />
        </div>
        <ErrorState
          title="Pesanan Tidak Ditemukan"
          message={error || 'Pesanan yang Anda cari tidak tersedia.'}
          onRetry={() => navigate('/orders')}
        />
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Desktop Navbar */}
      <div className="desktop-only" style={{ width: '100%' }}>
        <Navbar />
      </div>

      {/* Top Header */}
      <div className="page-header-nav">
        <button onClick={() => navigate('/orders')} className="icon-btn" aria-label="Kembali">
          <ArrowLeft size={20} />
        </button>
        <span className="page-header-title">Rincian Pesanan</span>
        <div style={{ width: '40px' }} />
      </div>

      <main className="page-content-standalone">
        <div className="order-detail-container">
          {/* Success Banner if redirected from checkout */}
          {isNewOrder && (
            <div style={{
              backgroundColor: '#E8F5E9',
              border: '1.5px solid #81C784',
              borderRadius: 'var(--radius-lg)',
              padding: '18px',
              textAlign: 'center',
              marginBottom: '18px',
              boxShadow: 'var(--shadow-xs)'
            }}>
              <CheckCircle size={36} color="#2E7D32" style={{ margin: '0 auto 8px auto' }} />
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#2E7D32', marginBottom: '4px' }}>
                Pesanan Berhasil Dibuat!
              </h3>
              <p style={{ fontSize: '0.84rem', color: '#1B5E20' }}>
                Terima kasih! Barista BrewSpace sedang menyiapkan pesanan kopi terbaik untuk Anda.
              </p>
            </div>
          )}

          {/* Order Status Card */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            border: '1px solid var(--border-light)',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Nomor Pesanan</span>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>{order.order_number}</strong>
              </div>
              <span className={`status-badge ${order.status}`} style={{ fontSize: '0.78rem' }}>
                ● {order.status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Calendar size={14} />
              <span>Waktu Pemesanan: {formatDate(order.created_at)}</span>
            </div>
          </div>

          {/* Ordered Items List */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            border: '1px solid var(--border-light)',
            marginBottom: '16px',
            boxShadow: 'var(--shadow-xs)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Package size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--primary)' }}>
                Item Pesanan ({order.order_items?.length || 0})
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {order.order_items?.map((item) => (
                <div key={item.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--border-light)',
                  paddingBottom: '12px'
                }}>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-main)' }}>
                      {item.product_name}
                    </h4>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      {item.quantity} x {formatRupiah(item.price)}
                    </span>
                  </div>
                  <strong style={{ fontSize: '0.92rem', color: 'var(--primary)' }}>
                    {formatRupiah(item.subtotal || item.price * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            {/* Price Breakdown */}
            <div style={{ marginTop: '14px' }}>
              <div className="summary-row">
                <span>Total Harga Produk</span>
                <span>{formatRupiah(Number(order.total_amount) - 15000 > 0 ? Number(order.total_amount) - 15000 : Number(order.total_amount))}</span>
              </div>
              <div className="summary-row">
                <span>Biaya Pengiriman</span>
                <span>{formatRupiah(15000)}</span>
              </div>
              <div className="summary-row total">
                <span>Total Pembayaran</span>
                <span>{formatRupiah(order.total_amount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '18px',
            border: '1px solid var(--border-light)',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-xs)',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <MapPin size={16} color="var(--secondary)" />
                <strong style={{ fontSize: '0.84rem', color: 'var(--primary)' }}>Alamat Pengiriman</strong>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', paddingLeft: '22px' }}>
                {order.shipping_address}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Phone size={16} color="var(--secondary)" />
                <strong style={{ fontSize: '0.84rem', color: 'var(--primary)' }}>No. Telepon Penerima</strong>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', paddingLeft: '22px' }}>
                {order.shipping_phone}
              </p>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <CreditCard size={16} color="var(--secondary)" />
                <strong style={{ fontSize: '0.84rem', color: 'var(--primary)' }}>Metode Pembayaran</strong>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-main)', paddingLeft: '22px' }}>
                {order.payment_method || 'Simulasi'}
              </p>
            </div>

            {order.notes && (
              <div>
                <strong style={{ fontSize: '0.84rem', color: 'var(--primary)' }}>Catatan Pesanan:</strong>
                <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Link to="/explore" className="btn btn-primary btn-block">
              Pesan Kopi Lainnya
            </Link>
            <Link to="/orders" className="btn btn-outline btn-block">
              Lihat Semua Pesanan
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
