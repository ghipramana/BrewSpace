import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Email dan password wajib diisi');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      await login(email, password);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div className="brand-icon-box" style={{ width: '56px', height: '56px', margin: '0 auto 12px auto' }}>
            <Coffee size={32} strokeWidth={2} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--primary)', fontWeight: 700 }}>
            Masuk ke BrewSpace
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Jelajahi dan nikmati ragam aroma kopi nusantara
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

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Pengguna</label>
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
            <label className="form-label">Kata Sandi</label>
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
            <span>{loading ? 'Memproses...' : 'Masuk Sekarang'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          <span>Belum memiliki akun? </span>
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
            Daftar di sini
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
