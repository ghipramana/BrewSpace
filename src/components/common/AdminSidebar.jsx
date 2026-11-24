import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Coffee, ExternalLink, LayoutDashboard, PackagePlus, ClipboardList } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const adminNavigation = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Kelola Produk', icon: PackagePlus },
  { to: '/admin/orders', label: 'Pesanan Pelanggan', icon: ClipboardList }
];

export const AdminSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="admin-sidebar">
      <Link to="/admin" className="admin-brand">
        <span className="admin-brand-icon"><Coffee size={22} /></span>
        <span><strong>BrewSpace</strong><small>ADMIN PANEL</small></span>
      </Link>

      <div className="admin-sidebar-label">MENU ADMIN</div>
      <nav className="admin-side-nav" aria-label="Navigasi admin">
        {adminNavigation.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => `admin-side-link ${isActive ? 'active' : ''}`}>
            <Icon size={18} /> {label}
          </NavLink>
        ))}
      </nav>

      <Link to="/" className="admin-mobile-store-link"><ExternalLink size={16} /> Lihat Toko</Link>

      <div className="admin-sidebar-bottom">
        <div className="admin-account-label">Masuk sebagai admin</div>
        <div className="admin-account-email" title={user?.email}>{user?.email || 'Admin BrewSpace'}</div>
        <Link to="/" className="admin-store-link"><ExternalLink size={16} /> Lihat Toko</Link>
      </div>
    </aside>
  );
};
