import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading: authLoading } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated) navigate('/', { replace: true });
  }, [authLoading, isAuthenticated, navigate]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setErrorMsg('Semua data wajib diisi');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Kata sandi minimal 6 karakter');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const result = await register(email, password, fullName);
      if (result.requiresEmailConfirmation) {
        setSuccessMsg('Akun berhasil dibuat. Cek email untuk verifikasi, lalu masuk dengan akun tersebut.');
        return;
      }
      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg(err.message || 'Pendaftaran gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div className="brand-icon-box" style={{ width: '56px', height: '56px', margin: '0 auto 12px auto' }}>
            <Coffee size={32} strokeWidth={2} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary)', fontWeight: 700 }}>
            Daftar Akun BrewSpace
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Bergabung bersama ribuan penikmat kopi spesial Indonesia
          </p>
        </div>

        {errorMsg && (
          <div style={{
            backgroundColor: '#FFEBEE',
            border: '1px solid #FFCDD2',
            color: '#D32F2F',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" style={{
            backgroundColor: '#E8F5E9',
            border: '1px solid #C8E6C9',
            color: '#256B36',
            padding: '10px 14px',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.82rem',
            marginBottom: '16px'
          }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: Budi Santoso"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <User size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Alamat Email</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Kata Sandi (Minimal 6 Karakter)</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '40px' }}
                required
              />
              <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary btn-block"
            style={{ padding: '14px', fontSize: '0.96rem' }}
          >
            <span>{loading ? 'Mendaftarkan...' : 'Daftar Akun Baru'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <span>Sudah memiliki akun? </span>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Masuk di sini
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/" style={{ fontSize: '0.82rem', color: 'var(--secondary)', textDecoration: 'none' }}>
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};
