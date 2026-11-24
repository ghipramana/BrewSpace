import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { AdminSidebar } from '../components/common/AdminSidebar';
import { useAuth } from '../context/AuthContext';
import './AdminPages.css';

export const AdminAccount = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Admin BrewSpace';

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="admin-dashboard-shell">
      <AdminSidebar />
      <main className="admin-main">
        <header className="admin-topbar"><div><span className="admin-topbar-eyebrow">BREWSPACE MANAGEMENT</span><strong>Akun Admin</strong></div></header>
        <div className="admin-content">
          <section className="admin-page-intro"><div><span className="admin-welcome-tag">PENGATURAN AKUN</span><h1>Akun Admin</h1><p>Informasi akun yang sedang digunakan untuk mengelola toko.</p></div></section>
          <section className="admin-account-card">
            <span className="admin-account-avatar"><UserRound size={28} /></span>
            <div className="admin-account-details"><h2>{fullName}</h2><p>{user?.email}</p><span><ShieldCheck size={15} /> Admin BrewSpace</span></div>
            <div className="admin-account-actions">
              <Link to="/profile" className="admin-secondary-action">Edit profil <ArrowRight size={16} /></Link>
              <button type="button" className="admin-logout-action" onClick={handleLogout}><LogOut size={16} /> Keluar</button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};
