import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Coffee, Lock, Mail, User, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

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
      await register(email, password, fullName);
      navigate('/');
    } catch (err) {
      console.error('Register error:', err);
      setErrorMsg(err.message || 'Pendaftaran gagal. Silakan coba kembali.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container" style={{ justifyContent: 'center', padding: '24px 20px' }}>
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

      <form onSubmit={handleRegister} style={{
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div className="form-group">
          <label className="form-label">Nama Lengkap</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Budi Santoso"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={{ paddingLeft: '38px' }}
            />
            <User size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
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
              required
              style={{ paddingLeft: '38px' }}
            />
            <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '15px' }} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Kata Sandi (Minimal 6 karakter)</label>
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
          {loading ? 'Mendaftarkan Akun...' : 'Daftar Sekarang'}
          <ArrowRight size={16} />
        </button>
      </form>

      <p style={{ textAlign: 'center', fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '20px' }}>
        Sudah memiliki akun?{' '}
        <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, textDecoration: 'none' }}>
          Masuk di sini
        </Link>
      </p>
    </div>
  );
};
