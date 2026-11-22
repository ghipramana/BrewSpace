import React from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Navbar = ({ title, showBack = false, onBack }) => {
  const { itemCount } = useCart();

  return (
    <header className="top-header">
      <Link to="/" className="brand-wrapper">
        <div className="brand-icon-box">
          <Coffee size={22} strokeWidth={2.2} />
        </div>
        <div>
          <span className="brand-title">BrewSpace</span>
          <span className="brand-subtitle">Specialty Coffee</span>
        </div>
      </Link>

      <div className="header-actions">
        <Link to="/favorites" className="icon-btn" aria-label="Favorit">
          <Heart size={20} strokeWidth={2} />
        </Link>
        <Link to="/cart" className="icon-btn" aria-label="Keranjang Belanja">
          <ShoppingBag size={20} strokeWidth={2} />
          {itemCount > 0 && <span className="badge-count">{itemCount}</span>}
        </Link>
      </div>
    </header>
  );
};
