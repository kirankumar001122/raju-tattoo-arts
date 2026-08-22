import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, MapPin, Phone, Mail, Clock, Share2, Globe, MessageCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand Info */}
          <div>
            <div className="brand-logo" style={{ marginBottom: '16px' }}>
              <Flame className="text-gold" size={24} />
              <span>RAJU</span> TATTOO ARTS
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px', maxWidth: '320px' }}>
              Transforming individual stories into timeless custom ink. World-class sterility, custom art design, and passionate craftsmanship.
            </p>
            <div style={{ display: 'flex', gap: '16px', color: 'var(--text-secondary)' }}>
              <a href="#share" style={{ color: 'var(--text-secondary)', transition: '0.2s' }}><Share2 size={20} /></a>
              <a href="#website" style={{ color: 'var(--text-secondary)', transition: '0.2s' }}><Globe size={20} /></a>
              <a href="#chat" style={{ color: 'var(--text-secondary)', transition: '0.2s' }}><MessageCircle size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="footer-title">Navigation</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Studio</Link></li>
              <li><Link to="/services">Tattoo Services</Link></li>
              <li><Link to="/booking">Book Appointment</Link></li>
              <li><Link to="/contact">Contact & Map</Link></li>
              <li><Link to="/admin/login">Admin Portal</Link></li>
            </ul>
          </div>

          {/* Studio Hours */}
          <div>
            <h4 className="footer-title">Opening Hours</h4>
            <ul className="footer-links" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} className="text-gold" /> Mon - Sat: 11:00 AM - 08:30 PM
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={16} className="text-gold" /> Sunday: 12:00 PM - 06:00 PM
              </li>
              <li style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px' }}>
                * Walk-ins subject to availability. Appointments recommended.
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="footer-title">Contact Studio</h4>
            <ul className="footer-links" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <MapPin size={18} className="text-gold" /> Malur, Karnataka, India
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Phone size={18} className="text-gold" /> +91 76762 72709
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <Mail size={18} className="text-gold" /> <a href="mailto:darshantejomaya@gmail.com" style={{ color: 'inherit' }}>darshantejomaya@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Raju Tattoo Arts Studio. All rights reserved. Professional Ink & Custom Design.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
