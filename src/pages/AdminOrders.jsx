import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ClipboardList, Package } from 'lucide-react';
import { AdminSidebar } from '../components/common/AdminSidebar';
import { formatRupiah } from '../config/constants';
import { getAdminOrders } from '../services/api';
import './AdminPages.css';

const formatOrderDate = (value) => new Intl.DateTimeFormat('id-ID', {
  dateStyle: 'medium', timeStyle: 'short'
}).format(new Date(value));

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAdminOrders();
      setOrders(result.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pesanan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  return (
    <div className="admin-dashboard-shell">
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-topbar-eyebrow">BREWSPACE MANAGEMENT</span><strong>Pesanan</strong></div></header>
        <div className="admin-content">
          <section className="admin-page-intro">
            <div><span className="admin-welcome-tag">TRANSAKSI TOKO</span><h1>Pesanan Pelanggan</h1><p>Lihat pesanan terbaru yang masuk ke BrewSpace.</p></div>
            <button className="admin-page-refresh" type="button" onClick={loadOrders} disabled={loading}><RefreshCw size={16} /> Segarkan</button>
          </section>

          <section className="admin-page-card">
            <div className="admin-page-card-heading"><div><ClipboardList size={20} /><h2>Daftar Pesanan</h2></div><span>{loading ? 'Memuat…' : `${orders.length} pesanan`}</span></div>
            {error ? <div className="admin-page-message error" role="alert">{error} Pastikan query akses dashboard admin sudah dijalankan di Supabase.</div>
              : loading ? <div className="admin-page-message">Memuat data pesanan…</div>
                : orders.length === 0 ? <div className="admin-page-message">Belum ada pesanan pelanggan.</div>
                  : <div className="admin-table-wrap"><table className="admin-data-table">
                    <thead><tr><th>Nomor</th><th>Pelanggan</th><th>Produk</th><th>Total</th><th>Status</th><th>Tanggal</th></tr></thead>
                    <tbody>{orders.map((order) => (
                      <tr key={order.id}>
                        <td><strong>{order.order_number}</strong></td>
                        <td><span className="admin-table-primary">{order.customer?.full_name || 'Pelanggan'}</span><small>{order.customer?.email || 'Email tidak tersedia'}</small></td>
                        <td><span className="admin-order-items"><Package size={14} /> {(order.order_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0)} item</span></td>
                        <td>{formatRupiah(order.total_amount)}</td>
                        <td><span className={`admin-order-status ${String(order.status || '').toLowerCase()}`}>{order.status}</span></td>
                        <td>{formatOrderDate(order.created_at)}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>}
          </section>
        </div>
      </main>
    </div>
  );
};
