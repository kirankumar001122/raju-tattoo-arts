import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyBookings, getMyContactEnquiries, updateBookingFcmToken } from '../services/api';
import { requestNotificationPermissionAndGetToken } from '../firebase';
import { Calendar, Clock, RefreshCw, AlertCircle, Loader2, Sparkles, PlusCircle, MessageSquare, Mail, Bell } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings' or 'enquiries'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fcmEnabled, setFcmEnabled] = useState(false);
  const [fcmLoading, setFcmLoading] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bookingsRes, enquiriesRes] = await Promise.all([
        getMyBookings(),
        getMyContactEnquiries()
      ]);
      setBookings(bookingsRes.data || []);
      setEnquiries(enquiriesRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to retrieve your account data. Please check network connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableNotifications = async () => {
    setFcmLoading(true);
    try {
      const token = await requestNotificationPermissionAndGetToken();
      if (token) {
        setFcmEnabled(true);
        if (bookings && bookings.length > 0) {
          for (const b of bookings) {
            try {
              await updateBookingFcmToken(b.id, token);
            } catch (e) {
              console.warn('FCM token save for booking warning:', e);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Notification permission error:', err);
    } finally {
      setFcmLoading(false);
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Your appointment request has been received and is awaiting confirmation from the studio.';
      case 'CONFIRMED':
        return 'Great news! Your appointment has been confirmed by Raju Tattoo Arts.';
      case 'COMPLETED':
        return 'Your appointment has been marked as completed. Thank you for choosing Raju Tattoo Arts!';
      case 'CANCELLED':
        return 'Unfortunately, your appointment has been cancelled. Please contact the studio if you need more information.';
      default:
        return 'Current status: ' + status;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-pending">PENDING</span>;
      case 'CONFIRMED':
        return <span className="badge badge-confirmed">CONFIRMED</span>;
      case 'COMPLETED':
        return <span className="badge badge-completed">COMPLETED</span>;
      case 'CANCELLED':
        return <span className="badge badge-cancelled">CANCELLED</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="section-padding" style={{ paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <h1 className="section-title" style={{ textAlign: 'left', marginBottom: '8px' }}>
              MY <span className="text-gold">ACCOUNT PORTAL</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              View and track your tattoo appointments and submitted studio enquiries in real time.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={fetchUserData}
              disabled={loading}
              className="btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
            <Link to="/booking" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              <PlusCircle size={16} /> New Booking
            </Link>
          </div>
        </div>

        {/* PUSH NOTIFICATIONS BANNER */}
        <div style={{
          backgroundColor: 'rgba(201, 162, 39, 0.06)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-sm)',
          padding: '14px 20px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} className="text-gold" />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>
              Enable push notifications to receive instant browser updates for your appointments.
            </span>
          </div>
          <button
            onClick={handleEnableNotifications}
            disabled={fcmEnabled || fcmLoading}
            className="btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.85rem' }}
          >
            {fcmEnabled ? '✓ Notifications Enabled' : (fcmLoading ? 'Enabling...' : 'Enable Notifications')}
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '12px' }}>
          <button
            onClick={() => setActiveTab('bookings')}
            className={activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            <Calendar size={16} /> My Appointments ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab('enquiries')}
            className={activeTab === 'enquiries' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            <MessageSquare size={16} /> My Contact Enquiries ({enquiries.length})
          </button>
        </div>

        {/* ERROR BANNER */}
        {error && (
          <div className="alert-box alert-error" style={{ marginBottom: '24px' }}>
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <div>{error}</div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
            <Loader2 className="animate-spin" size={36} style={{ margin: '0 auto 16px auto', color: 'var(--accent-gold)' }} />
            <p>Fetching your account history from backend...</p>
          </div>
        ) : activeTab === 'bookings' ? (
          /* TAB 1: BOOKINGS LIST */
          bookings.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 30px' }}>
              <Calendar size={48} className="text-gold" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No Bookings Found</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px auto', fontSize: '0.92rem' }}>
                You haven't submitted any tattoo appointment requests yet. Ready to get inked?
              </p>
              <Link to="/booking" className="btn-primary" style={{ padding: '12px 28px' }}>
                Book Your Appointment Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {bookings.map((booking) => (
                <div key={booking.id} className="card" style={{ padding: '32px', borderColor: 'var(--border-dark)' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    borderBottom: '1px solid var(--border-dark)',
                    paddingBottom: '16px',
                    marginBottom: '20px',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, letterSpacing: '0.5px' }}>BOOKING ID</span>
                      <h3 style={{ fontSize: '1.6rem', fontWeight: 800 }}>#{booking.id}</h3>
                    </div>
                    <div>{getStatusBadge(booking.status)}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Service</span>
                      <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginTop: '4px' }}>{booking.service}</h4>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Appointment Date & Time</span>
                      <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={16} className="text-gold" /> {booking.appointmentDate} at {booking.appointmentTime}
                      </h4>
                    </div>

                    <div>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Submitted On</span>
                      <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
                      </h4>
                    </div>
                  </div>

                  {booking.requirements && (
                    <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#0D0D0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-dark)' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}>Tattoo Requirements / Idea:</span>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>{booking.requirements}</p>
                    </div>
                  )}

                  {/* Status Message Box */}
                  <div style={{
                    backgroundColor: 'rgba(201, 162, 39, 0.06)',
                    border: '1px solid var(--border-gold)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '16px 20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <Sparkles size={16} className="text-gold" />
                      <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-gold)' }}>STATUS DETAILS</span>
                    </div>
                    <p style={{ color: 'var(--text-primary)', fontSize: '0.94rem' }}>
                      "{getStatusMessage(booking.status)}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          /* TAB 2: CONTACT ENQUIRIES LIST */
          enquiries.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '50px 30px' }}>
              <MessageSquare size={48} className="text-gold" style={{ margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>No Enquiries Submitted</h3>
              <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 24px auto', fontSize: '0.92rem' }}>
                You haven't sent any messages or enquiries to the studio yet.
              </p>
              <Link to="/contact" className="btn-primary" style={{ padding: '12px 28px' }}>
                Contact Studio Now
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {enquiries.map((enquiry) => (
                <div key={enquiry.id} className="card" style={{ padding: '24px', borderColor: 'var(--border-dark)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>Enquiry #{enquiry.id}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div style={{ padding: '14px', backgroundColor: '#0D0D0D', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-dark)', fontSize: '0.92rem' }}>
                    <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Your Message:</strong>
                    <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>{enquiry.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MyBookings;
