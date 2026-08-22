import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Menu, X, Calendar, LogOut, User as UserIcon, Shield } from 'lucide-react';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const isAdmin = user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');
  const isUser = user && (user.role === 'ROLE_USER' || user.role === 'USER');

  // Build navigation links according to active user role and requirement 7
  let navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Booking', path: '/booking' },
  ];

  if (isAdmin) {
    navLinks.push({ name: 'Admin Dashboard', path: '/admin' });
    navLinks.push({ name: 'Track Booking', path: '/track-booking' });
    navLinks.push({ name: 'Contact', path: '/contact' });
  } else if (isUser) {
    navLinks.push({ name: 'My Bookings', path: '/my-bookings' });
    navLinks.push({ name: 'Track Booking', path: '/track-booking' });
    navLinks.push({ name: 'Contact', path: '/contact' });
    navLinks.push({ name: 'Admin', path: '/admin/login' });
  } else {
    // Unauthenticated Guest
    navLinks.push({ name: 'Track Booking', path: '/track-booking' });
    navLinks.push({ name: 'Contact', path: '/contact' });
    navLinks.push({ name: 'Admin', path: '/admin/login' });
  }

  return (
    <nav className="navbar">
      <div className="container nav-container">
        <Link to="/" className="brand-logo" onClick={closeMenu}>
          <Flame className="text-gold" size={28} />
          <span>RAJU</span> TATTOO ARTS
        </Link>

        {/* Mobile menu toggle */}
        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Toggle Navigation">
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Navigation Links */}
        <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                onClick={closeMenu}
              >
                {link.name}
              </Link>
            </li>
          ))}

          {/* Auth Controls */}
          {user ? (
            <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {isAdmin ? <Shield size={15} /> : <UserIcon size={15} />}
                {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                title="Logout"
              >
                <LogOut size={14} /> Logout
              </button>
            </li>
          ) : (
            <>
              <li>
                <Link
                  to="/login"
                  className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}
                  onClick={closeMenu}
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </li>
            </>
          )}

          <li>
            <Link to="/booking" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }} onClick={closeMenu}>
              <Calendar size={16} /> BOOK NOW
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
