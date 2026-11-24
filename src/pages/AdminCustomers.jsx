import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, Search, Users } from 'lucide-react';
import { AdminSidebar } from '../components/common/AdminSidebar';
import { getAdminCustomers } from '../services/api';
import './AdminPages.css';

export const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAdminCustomers();
      setCustomers(result.data || []);
    } catch (err) {
      setError(err.message || 'Gagal memuat data pelanggan.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadCustomers(); }, [loadCustomers]);

  const filteredCustomers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return customers;
    return customers.filter((customer) => `${customer.full_name || ''} ${customer.email || ''} ${customer.phone || ''}`.toLowerCase().includes(term));
  }, [customers, search]);

  return (
    <div className="admin-dashboard-shell">
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-topbar-eyebrow">BREWSPACE MANAGEMENT</span><strong>Pelanggan</strong></div></header>
        <div className="admin-content">
          <section className="admin-page-intro">
            <div><span className="admin-welcome-tag">DATA AKUN</span><h1>Pelanggan BrewSpace</h1><p>Lihat daftar akun pelanggan yang terdaftar.</p></div>
            <button className="admin-page-refresh" type="button" onClick={loadCustomers} disabled={loading}><RefreshCw size={16} /> Segarkan</button>
          </section>

          <section className="admin-page-card">
            <div className="admin-page-card-heading"><div><Users size={20} /><h2>Daftar Pelanggan</h2></div><span>{loading ? 'Memuat…' : `${filteredCustomers.length} pelanggan`}</span></div>
            <label className="admin-search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, email, atau nomor telepon" /></label>
            {error ? <div className="admin-page-message error" role="alert">{error} Pastikan query akses dashboard admin sudah dijalankan di Supabase.</div>
              : loading ? <div className="admin-page-message">Memuat data pelanggan…</div>
                : filteredCustomers.length === 0 ? <div className="admin-page-message">Tidak ada pelanggan yang cocok.</div>
                  : <div className="admin-table-wrap"><table className="admin-data-table">
                    <thead><tr><th>Nama</th><th>Email</th><th>Nomor telepon</th><th>Terdaftar</th></tr></thead>
                    <tbody>{filteredCustomers.map((customer) => (
                      <tr key={customer.id}>
                        <td><strong>{customer.full_name || 'Tanpa nama'}</strong></td>
                        <td>{customer.email}</td>
                        <td>{customer.phone || '—'}</td>
                        <td>{customer.created_at ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(customer.created_at)) : '—'}</td>
                      </tr>
                    ))}</tbody>
                  </table></div>}
          </section>
        </div>
      </main>
    </div>
  );
};
