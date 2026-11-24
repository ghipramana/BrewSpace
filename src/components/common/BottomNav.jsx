import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, ClipboardList, User, LogIn, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const BottomNav = () => {
  const { isAuthenticated, isAdmin, loading, adminLoading } = useAuth();
  const roleLoading = loading || (isAuthenticated && adminLoading);
  return (
    <nav className="bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        end
      >
        <Home size={22} strokeWidth={2} />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/explore"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Compass size={22} strokeWidth={2} />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to="/favorites"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <Heart size={22} strokeWidth={2} />
        <span>Favorit</span>
      </NavLink>

      {!roleLoading && (isAdmin ? (
        <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={22} strokeWidth={2} />
          <span>Admin</span>
        </NavLink>
      ) : (
        <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ClipboardList size={22} strokeWidth={2} />
          <span>Pesanan</span>
        </NavLink>
      ))}

      {!roleLoading && (isAuthenticated ? (
        <NavLink
          to="/profile"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <User size={22} strokeWidth={2} />
          <span>Profil</span>
        </NavLink>
      ) : (
        <NavLink
          to="/login"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <LogIn size={22} strokeWidth={2} />
          <span>Masuk</span>
        </NavLink>
      ))}
    </nav>
  );
};
