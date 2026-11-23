import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Phone, MapPin, Coffee, Download, 
  LogOut, Edit3, Check, ShieldCheck, BookOpen, Sparkles, PackagePlus
} from 'lucide-react';
import { Navbar } from '../components/common/Navbar';
import { BottomNav } from '../components/common/BottomNav';
import { useAuth } from '../context/AuthContext';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { getUserProfile, updateUserProfile } from '../services/api';

export const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateUserName, isAdmin } = useAuth();
  const { isInstallable, promptInstall } = useInstallPrompt();

  const [profile, setProfile] = useState({
    full_name: user?.user_metadata?.full_name || 'Penikmat Kopi Praktikum',
    email: user?.email || 'mahasiswa@brewspace.ac.id',
    phone: '081234567890',
    address: 'Jl. Kampus Merdeka No. 12, Sleman, Yogyakarta',
    avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...profile });
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const res = await getUserProfile(user.id);
          if (res.success && res.data) {
            setProfile(prev => ({ ...prev, ...res.data }));
            setFormData(prev => ({ ...prev, ...res.data }));
          }
        } catch (err) {
          console.warn('Gagal load profil via API:', err.message);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      await updateUserProfile(user?.id || 'u0000000-0000-0000-0000-000000000001', formData);
      setProfile({ ...formData });
      if (user) await updateUserName(formData.full_name);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Gagal menyimpan profil: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Apakah Anda yakin ingin keluar dari akun BrewSpace?')) {
      await logout();
      navigate('/');
    }
  };

  return (
    <div className="app-container">
      <Navbar />

      <main className="page-content">
        <div className="profile-container">
          {/* Profile Card Header */}
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: '28px 24px',
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border-light)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            marginBottom: '16px'
          }}>
            <button
              onClick={() => setIsEditing(!isEditing)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.84rem',
                fontWeight: 600
              }}
            >
              <Edit3 size={15} />
              <span>{isEditing ? 'Batal' : 'Edit'}</span>
            </button>

            <img
              src={profile.avatar_url}
              alt={profile.full_name}
              style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--surface-alt)',
                marginBottom: '14px',
                boxShadow: 'var(--shadow-sm)'
              }}
            />

            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', color: 'var(--primary)', fontWeight: 700 }}>
              {profile.full_name}
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {profile.email}
            </p>

            {saveSuccess && (
              <div style={{
                marginTop: '12px',
                backgroundColor: '#E8F5E9',
                color: '#2E7D32',
                fontSize: '0.82rem',
                fontWeight: 600,
                padding: '6px 16px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Check size={14} />
                <span>Profil berhasil diperbarui</span>
              </div>
            )}
          </div>

          {isAdmin && (
            <Link to="/admin/products" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginBottom: 18, textDecoration: 'none' }}>
              <PackagePlus size={17} /> Kelola Produk
            </Link>
          )}

          {/* Edit Form or Information Details */}
          <div>
            {isEditing ? (
              <form onSubmit={handleSaveProfile} style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '22px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-xs)',
                marginBottom: '16px'
              }}>
                <div className="form-group">
                  <label className="form-label">Nama Lengkap</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Nomor WhatsApp / Telepon</label>
                  <input
                    type="tel"
                    className="form-input"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Alamat Pengiriman Utama</label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="btn btn-primary btn-block"
                  style={{ marginTop: '10px' }}
                >
                  {saveLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </form>
            ) : (
              <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px',
                border: '1px solid var(--border-light)',
                boxShadow: 'var(--shadow-xs)',
                marginBottom: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Phone size={18} color="var(--secondary)" />
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Nomor Telepon</span>
                    <strong style={{ fontSize: '0.88rem' }}>{profile.phone}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <MapPin size={18} color="var(--secondary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', display: 'block' }}>Alamat Pengiriman Default</span>
                    <p style={{ fontSize: '0.86rem', lineHeight: 1.45 }}>{profile.address}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PWA Install Banner */}
            {isInstallable && (
              <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: '18px',
                border: '1.5px solid var(--secondary)',
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Download size={22} color="var(--primary)" />
                  <div>
                    <strong style={{ fontSize: '0.9rem', color: 'var(--primary)', display: 'block' }}>
                      Pasang Aplikasi BrewSpace (PWA)
                    </strong>
                    <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                      Akses cepat dari layar utama & offline catalog
                    </span>
                  </div>
                </div>
                <button
                  onClick={promptInstall}
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                >
                  Pasang
                </button>
              </div>
            )}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="btn btn-outline btn-block"
              style={{
                borderColor: '#D32F2F',
                color: '#D32F2F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '12px'
              }}
            >
              <LogOut size={16} />
              <span>Keluar dari Akun</span>
            </button>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};
