import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Heart, ClipboardList, User } from 'lucide-react';

export const BottomNav = () => {
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

      <NavLink
        to="/orders"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <ClipboardList size={22} strokeWidth={2} />
        <span>Pesanan</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
      >
        <User size={22} strokeWidth={2} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
};
