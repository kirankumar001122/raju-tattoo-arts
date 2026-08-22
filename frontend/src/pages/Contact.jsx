import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createContactEnquiry } from '../services/api';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, AlertCircle, Loader2, UserCheck } from 'lucide-react';

const Contact = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto pre-fill registered account profile details if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    setErrorMessage('');

    const cleanName = formData.name.trim();
    const cleanEmail = formData.email.trim();
    const cleanPhone = formData.phone.trim();
    const cleanMessage = formData.message.trim();

    if (!cleanName || !cleanEmail || !cleanPhone || !cleanMessage) {
      setErrorMessage('All fields are required. Please fill in your name, email, phone, and message.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        message: cleanMessage,
      };

      await createContactEnquiry(payload);
      setSuccess(true);

      // Keep user profile fields intact if logged in, clear message only
      if (user) {
        setFormData((prev) => ({ ...prev, message: '' }));
      } else {
        setFormData({ name: '', email: '', phone: '', message: '' });
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding" style={{ paddingTop: '120px' }}>
      <div className="container">
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 className="section-title">CONTACT <span className="text-gold">OUR STUDIO</span></h1>
          <p className="section-subtitle">
            Have questions about custom designs, pricing, or aftercare? Send us a message or visit our studio.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '40px'
        }}>
          {/* Contact Details Card */}
          <div>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>STUDIO <span className="text-gold">LOCATION</span></h2>

            <div className="card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <MapPin className="text-gold" size={24} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Studio Address</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    Malur, Karnataka, India
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <Phone className="text-gold" size={24} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Phone Number</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    +91 76762 72709
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <Mail className="text-gold" size={24} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Email Address</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    <a href="mailto:darshantejomaya@gmail.com" style={{ color: 'inherit' }}>darshantejomaya@gmail.com</a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <Clock className="text-gold" size={24} style={{ flexShrink: 0 }} />
                <div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '4px' }}>Working Hours</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                    Monday - Saturday: 11:00 AM - 08:30 PM<br />
                    Sunday: 12:00 PM - 06:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Google Map */}
            <div className="card" style={{ height: '200px', padding: 0, overflow: 'hidden', position: 'relative' }}>
              <iframe
                title="Studio Location Map"
                src="https://maps.google.com/maps?q=Malur,Karnataka,India&t=&z=13&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(120%)' }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="card" style={{ padding: '36px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>SEND A <span className="text-gold">MESSAGE</span></h2>

            {user && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 14px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(201, 162, 39, 0.1)',
                border: '1px solid var(--border-gold)',
                color: 'var(--accent-gold)',
                fontSize: '0.85rem',
                marginBottom: '20px'
              }}>
                <UserCheck size={16} /> Authenticated Client Profile: <strong>{user.name}</strong> ({user.email})
              </div>
            )}

            {success && (
              <div className="alert-box alert-success" style={{ marginBottom: '20px' }}>
                <CheckCircle2 size={24} />
                <div>
                  <strong>Enquiry Sent Successfully!</strong><br />
                  Thank you for reaching out. We will respond to your message within 24 hours.
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="alert-box alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={24} />
                <div>
                  <strong>Error:</strong> {errorMessage}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter full name"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Your Message / Inquiry *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Type your message here..."
                  required
                  className="form-textarea"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', padding: '14px' }}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={18} /> Sending Message...
                  </>
                ) : (
                  <>
                    <Send size={18} /> SEND MESSAGE
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
