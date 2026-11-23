import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ChevronRight, Package, Calendar } from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { LoadingState } from '../components/common/LoadingState';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { getOrders } from '../services/api';
import { formatRupiah, formatDate } from '../config/constants';

export const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getOrders();
      if (res.success) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Gagal memuat riwayat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, []);

  return (
    <div className="app-container">
      <Navbar />

      <main className="page-content">
        <div className="page-title-section">
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 700 }}>
            Riwayat Pesanan
          </h1>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)' }}>
            Pantau status pemrosesan dan riwayat pembelian kopi Anda di BrewSpace.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Memuat riwayat transaksi Anda..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchUserOrders} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Belum Ada Pesanan"
            description="Anda belum pernah melakukan pemesanan kopi. Yuk coba seduhan kopi terbaik kami!"
            actionText="Mulai Belanja Kopi"
            actionLink="/explore"
          />
        ) : (
          <div className="orders-container">
            <div className="orders-list-grid">
              {orders.map((order) => {
                const firstItemName = order.order_items?.[0]?.product_name || 'Koleksi Kopi BrewSpace';
                const moreItems = order.order_items?.length > 1 ? `+${order.order_items.length - 1} produk lainnya` : '';

                return (
                  <Link
                    key={order.id}
                    to={`/orders/${order.id}`}
                    className="order-card-link"
                  >
                    {/* Top Bar: Order ID & Status Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={16} color="var(--primary)" />
                        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)' }}>
                          {order.order_number}
                        </span>
                      </div>
                      <span className={`status-badge ${order.status}`}>
                        ● {order.status}
                      </span>
                    </div>

                    {/* Date */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} />
                      <span>{formatDate(order.created_at)}</span>
                    </div>

                    {/* Summary Product snippet */}
                    <div style={{
                      backgroundColor: 'var(--surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      fontSize: '0.84rem'
                    }}>
                      <p style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        {firstItemName}
                      </p>
                      {moreItems && (
                        <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {moreItems}
                        </p>
                      )}
                    </div>

                    {/* Footer: Total & Arrow */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderTop: '1px dashed var(--border-light)',
                      paddingTop: '10px',
                      marginTop: '4px'
                    }}>
                      <div>
                        <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Total Belanja</span>
                        <strong style={{ fontSize: '1.05rem', color: 'var(--primary)' }}>{formatRupiah(order.total_amount)}</strong>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem', fontWeight: 600, color: 'var(--secondary)' }}>
                        <span>Rincian</span>
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
