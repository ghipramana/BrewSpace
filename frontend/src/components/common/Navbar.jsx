import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Coffee, ShoppingBag, Heart, User, LogIn } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = () => {
  const { itemCount } = useCart();
  const { user, isAuthenticated } = useAuth();

  return (
    <header className="top-header">
      <div className="top-header-inner">
        {/* Brand Logo & Name */}
        <Link to="/" className="brand-wrapper">
          <div className="brand-icon-box">
            <Coffee size={22} strokeWidth={2.2} />
          </div>
          <div>
            <span className="brand-title">BrewSpace</span>
            <span className="brand-subtitle">Specialty Coffee</span>
          </div>
        </Link>

        {/* Desktop Navigation Menu (Hidden on mobile, visible on tablet & PC) */}
        <nav className="desktop-nav-menu">
          <NavLink
            to="/"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
            end
          >
            Beranda
          </NavLink>
          <NavLink
            to="/explore"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            Jelajah Kopi
          </NavLink>
          <NavLink
            to="/favorites"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            Favorit
          </NavLink>
          <NavLink
            to="/orders"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            Pesanan
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) => `desktop-nav-link ${isActive ? 'active' : ''}`}
          >
            Profil
          </NavLink>
        </nav>

        {/* Header Right Actions */}
        <div className="header-actions">
          {/* Mobile-only Favorites icon */}
          <Link to="/favorites" className="icon-btn mobile-only" aria-label="Favorit">
            <Heart size={20} strokeWidth={2} />
          </Link>

          {/* Cart button */}
          <Link to="/cart" className="icon-btn cart-btn-header" aria-label="Keranjang Belanja">
            <ShoppingBag size={20} strokeWidth={2} />
            <span className="desktop-only cart-text">Keranjang</span>
            {itemCount > 0 && <span className="badge-count">{itemCount}</span>}
          </Link>

          {/* Auth status on Desktop */}
          {isAuthenticated ? (
            <Link to="/profile" className="profile-header-pill desktop-only" aria-label="Profil Akun">
              <div className="profile-header-avatar">
                <User size={16} />
              </div>
              <span className="profile-header-name">
                {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Profil'}
              </span>
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary desktop-only btn-nav-login">
              <LogIn size={16} />
              <span>Masuk</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
