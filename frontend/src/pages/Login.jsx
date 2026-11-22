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
    <div className="app-container" style={{ justifyContent: 'center', padding: '24px 20px' }}>
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

      <form onSubmit={handleLogin} style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="form-group">
          <label className="form-label">Alamat Email</label>
          <div style={{ position: 'relative' }}>
            <input
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ paddingLeft: '38px' }}
            />
            <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Kata Sandi</label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ paddingLeft: '38px' }}
            />
            <Lock size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary btn-block"
          style={{ marginTop: '14px' }}
        >
          {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
          <ArrowRight size={16} />
        </button>

        {/* Demo Fast Login Helper */}
        <button
          type="button"
          onClick={() => {
            setEmail('demo@brewspace.com');
            setPassword('kopi123456');
          }}
          style={{
            marginTop: '12px',
            background: 'none',
            border: 'none',
            color: 'var(--secondary)',
            fontSize: '0.78rem',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'center',
            width: '100%'
          }}
        >
          Gunakan Akun Demo Mahasiswa
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '20px' }}>
        Belum memiliki akun?{' '}
        <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
          Daftar di sini
        </Link>
      </p>
    </div>
  );
};
