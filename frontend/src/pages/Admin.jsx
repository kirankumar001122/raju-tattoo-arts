import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllBookings, updateBookingStatus, getAllContactEnquiries, getRegisteredClients, getAdminPaymentMetrics } from '../services/api';
import { Calendar, CheckCircle2, Clock, XCircle, AlertCircle, RefreshCw, MessageSquare, Loader2, Filter, Layers, Shield, Users, CreditCard, IndianRupee, ShieldCheck } from 'lucide-react';

const Admin = () => {
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [clients, setClients] = useState([]);
  const [paymentMetrics, setPaymentMetrics] = useState({
    totalRevenue: 0,
    totalPayments: 0,
    paidPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    paymentsList: []
  });
  const [loading, setLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');
  const [enquiriesError, setEnquiriesError] = useState('');
  const [generalError, setGeneralError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'enquiries', 'clients', or 'payments'
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isAdmin = user && (user.role === 'ROLE_ADMIN' || user.role === 'ADMIN');

  useEffect(() => {
    if (isAdmin) {
      fetchDashboardData();
    }
  }, [user]);

  // Route protection: If not logged in as ADMIN, redirect to /admin/login
  if (authLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '120px 20px', color: 'var(--text-secondary)' }}>
        <Loader2 className="animate-spin" size={36} style={{ margin: '0 auto 16px auto', color: 'var(--accent-gold)' }} />
        <p>Verifying Admin Authentication...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  const fetchDashboardData = async () => {
    setLoading(true);
    setBookingsError('');
    setEnquiriesError('');
    setGeneralError('');

    try {
      const [bookingsRes, enquiriesRes, clientsRes, paymentsRes] = await Promise.all([
        getAllBookings(),
        getAllContactEnquiries(),
        getRegisteredClients(),
        getAdminPaymentMetrics()
      ]);
      setBookings(bookingsRes.data || []);
      setEnquiries(enquiriesRes.data || []);
      setClients(clientsRes.data || []);
      setPaymentMetrics(paymentsRes.data || {});
    } catch (err) {
      if (err.status === 401 || err.status === 403) {
        setGeneralError('Your admin session has expired. Please login again.');
      } else {
        setGeneralError('Unable to load dashboard data from backend. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    const bookingToUpdate = bookings.find((b) => b.id === bookingId);
    if (!bookingToUpdate || bookingToUpdate.status === newStatus) {
      return; // No change needed
    }

    const previousStatus = bookingToUpdate.status;

    // 1. Immediately update local React state (0ms UI & Counter response)
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
    );

    setUpdatingId(bookingId);
    setActionSuccess('');
    setGeneralError('');

    try {
      // 2. Persist update in MySQL database via Spring Boot API
      await updateBookingStatus(bookingId, newStatus);
      setActionSuccess(`Booking #${bookingId} status updated to ${newStatus}`);
    } catch (err) {
      // 3. Revert to previous status on failure
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: previousStatus } : b))
      );
      setGeneralError(err.message || `Failed to update status for booking #${bookingId}`);
    } finally {
      setUpdatingId(null);
    }
  };

  // Status Dropdown Color Theme Helper
  const getStatusDropdownStyle = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          backgroundColor: '#261F0D',
          color: '#F59E0B',
          borderColor: '#F59E0B',
          fontWeight: 700
        };
      case 'CONFIRMED':
        return {
          backgroundColor: '#0F1A2E',
          color: '#3B82F6',
          borderColor: '#3B82F6',
          fontWeight: 700
        };
      case 'COMPLETED':
        return {
          backgroundColor: '#0A261A',
          color: '#10B981',
          borderColor: '#10B981',
          fontWeight: 700
        };
      case 'CANCELLED':
        return {
          backgroundColor: '#2B1215',
          color: '#EF4444',
          borderColor: '#EF4444',
          fontWeight: 700
        };
      default:
        return {
          backgroundColor: 'var(--card-bg)',
          color: 'var(--text-primary)',
          borderColor: 'var(--border-dark)',
          fontWeight: 600
        };
    }
  };

  // Metric Computations
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const confirmedCount = bookings.filter((b) => b.status === 'CONFIRMED').length;
  const completedCount = bookings.filter((b) => b.status === 'COMPLETED').length;
  const cancelledCount = bookings.filter((b) => b.status === 'CANCELLED').length;

  // Filter Bookings by Status
  const filteredBookings = statusFilter === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status === statusFilter);

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
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
              <Shield size={16} /> PROTECTED ADMIN PORTAL
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>STUDIO <span className="text-gold">ADMIN DASHBOARD</span></h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Real-time booking management, client enquiries, and registered customer profiles connected to MySQL database.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.85rem' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh Data
          </button>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {actionSuccess && (
          <div className="alert-box alert-success" style={{ padding: '12px 18px', fontSize: '0.9rem' }}>
            <CheckCircle2 size={20} /> {actionSuccess}
          </div>
        )}

        {generalError && (
          <div className="alert-box alert-error" style={{ padding: '12px 18px', fontSize: '0.9rem' }}>
            <AlertCircle size={20} /> {generalError}
          </div>
        )}

        {/* METRICS GRID */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>TOTAL BOOKINGS</span>
              <Layers size={18} className="text-gold" />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{totalBookings}</h2>
          </div>

          <div className="card" style={{ padding: '20px', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-pending-text)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>PENDING</span>
              <Clock size={18} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-pending-text)' }}>{pendingCount}</h2>
          </div>

          <div className="card" style={{ padding: '20px', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-confirmed-text)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>CONFIRMED</span>
              <Calendar size={18} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-confirmed-text)' }}>{confirmedCount}</h2>
          </div>

          <div className="card" style={{ padding: '20px', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-completed-text)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>COMPLETED</span>
              <CheckCircle2 size={18} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-completed-text)' }}>{completedCount}</h2>
          </div>

          <div className="card" style={{ padding: '20px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-cancelled-text)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>CANCELLED</span>
              <XCircle size={18} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--status-cancelled-text)' }}>{cancelledCount}</h2>
          </div>

          <div className="card" style={{ padding: '20px', borderColor: 'var(--border-gold)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-gold)', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>REGISTERED CLIENTS</span>
              <Users size={18} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{clients.length}</h2>
          </div>

          <div className="card" style={{ padding: '20px', borderColor: '#10B981' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>TOTAL REVENUE (₹)</span>
              <IndianRupee size={18} />
            </div>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>
              ₹{paymentMetrics.totalRevenue ? Number(paymentMetrics.totalRevenue).toLocaleString() : '0'}
            </h2>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--border-dark)', paddingBottom: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setActiveTab('bookings');
              fetchDashboardData();
            }}
            className={activeTab === 'bookings' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            <Calendar size={16} /> Appointments ({totalBookings})
          </button>

          <button
            onClick={() => {
              setActiveTab('payments');
              fetchDashboardData();
            }}
            className={activeTab === 'payments' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            <CreditCard size={16} /> Payments ({paymentMetrics.totalPayments || 0})
          </button>

          <button
            onClick={() => {
              setActiveTab('enquiries');
              fetchDashboardData();
            }}
            className={activeTab === 'enquiries' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            <MessageSquare size={16} /> Contact Enquiries ({enquiries.length})
          </button>

          <button
            onClick={() => {
              setActiveTab('clients');
              fetchDashboardData();
            }}
            className={activeTab === 'clients' ? 'btn-primary' : 'btn-secondary'}
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            <Users size={16} /> Registered Clients ({clients.length})
          </button>
        </div>

        {/* TAB 1: APPOINTMENTS TABLE */}
        {activeTab === 'bookings' && (
          <div>
            {/* Filter Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <Filter size={16} /> Filter by Status:
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    backgroundColor: '#18181B',
                    color: '#F5F5F5',
                    border: '1px solid var(--accent-gold)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 14px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    outline: 'none',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
                  }}
                >
                  <option value="ALL" style={{ backgroundColor: '#18181B', color: '#FFFFFF', fontWeight: 600, padding: '8px' }}>
                    ALL ({totalBookings})
                  </option>
                  <option value="PENDING" style={{ backgroundColor: '#18181B', color: '#F59E0B', fontWeight: 700, padding: '8px' }}>
                    PENDING ({pendingCount})
                  </option>
                  <option value="CONFIRMED" style={{ backgroundColor: '#18181B', color: '#3B82F6', fontWeight: 700, padding: '8px' }}>
                    CONFIRMED ({confirmedCount})
                  </option>
                  <option value="COMPLETED" style={{ backgroundColor: '#18181B', color: '#10B981', fontWeight: 700, padding: '8px' }}>
                    COMPLETED ({completedCount})
                  </option>
                  <option value="CANCELLED" style={{ backgroundColor: '#18181B', color: '#EF4444', fontWeight: 700, padding: '8px' }}>
                    CANCELLED ({cancelledCount})
                  </option>
                </select>
              </div>
            </div>

            {bookingsError && (
              <div className="alert-box alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={20} /> {bookingsError}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 12px auto' }} />
                <p>Loading appointments...</p>
              </div>
            ) : bookingsError ? null : filteredBookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No appointment bookings found.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Service</th>
                      <th>Appt Date & Time</th>
                      <th>Status</th>
                      <th>Action / Change Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBookings.map((b) => (
                      <tr key={b.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>#{b.id}</td>
                        <td><strong>{b.customerName || (b.user && b.user.name)}</strong></td>
                        <td>{b.email || (b.user && b.user.email)}</td>
                        <td>{b.phone || (b.user && b.user.phone)}</td>
                        <td>{b.service}</td>
                        <td style={{ fontSize: '0.88rem' }}>
                          {b.appointmentDate} at {b.appointmentTime}
                        </td>
                        <td>{getStatusBadge(b.status)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <select
                              value={b.status}
                              disabled={updatingId === b.id}
                              onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              style={{
                                ...getStatusDropdownStyle(b.status),
                                borderRadius: 'var(--radius-sm)',
                                padding: '6px 12px',
                                fontSize: '0.85rem',
                                cursor: 'pointer',
                                outline: 'none',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                                transition: 'all 0.2s ease'
                              }}
                            >
                              <option value="PENDING" style={{ backgroundColor: '#18181B', color: '#F59E0B', fontWeight: 700, padding: '8px' }}>
                                PENDING
                              </option>
                              <option value="CONFIRMED" style={{ backgroundColor: '#18181B', color: '#3B82F6', fontWeight: 700, padding: '8px' }}>
                                CONFIRMED
                              </option>
                              <option value="COMPLETED" style={{ backgroundColor: '#18181B', color: '#10B981', fontWeight: 700, padding: '8px' }}>
                                COMPLETED
                              </option>
                              <option value="CANCELLED" style={{ backgroundColor: '#18181B', color: '#EF4444', fontWeight: 700, padding: '8px' }}>
                                CANCELLED
                              </option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB: PAYMENTS & TRANSACTIONS TABLE */}
        {activeTab === 'payments' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 12px auto' }} />
                <p>Loading payments data from MySQL...</p>
              </div>
            ) : (!paymentMetrics.paymentsList || paymentMetrics.paymentsList.length === 0) ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No payments recorded yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Payment ID</th>
                      <th>Booking ID</th>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Amount (₹)</th>
                      <th>Status</th>
                      <th>Razorpay Order ID</th>
                      <th>Razorpay Payment ID</th>
                      <th>Date & Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentMetrics.paymentsList.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>#{p.id}</td>
                        <td><strong>#{p.booking ? p.booking.id : 'N/A'}</strong></td>
                        <td>{p.booking ? p.booking.customerName : (p.user ? p.user.name : 'N/A')}</td>
                        <td>{p.booking ? p.booking.email : (p.user ? p.user.email : 'N/A')}</td>
                        <td style={{ fontWeight: 800, color: p.paymentStatus === 'PAID' ? '#10B981' : 'var(--text-primary)' }}>
                          ₹{p.amount}
                        </td>
                        <td>
                          {p.paymentStatus === 'PAID' ? (
                            <span className="badge badge-completed"><ShieldCheck size={12} style={{ display: 'inline', marginRight: '4px' }} /> PAID</span>
                          ) : p.paymentStatus === 'FAILED' ? (
                            <span className="badge badge-cancelled">FAILED</span>
                          ) : (
                            <span className="badge badge-pending">{p.paymentStatus}</span>
                          )}
                        </td>
                        <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{p.razorpayOrderId}</td>
                        <td style={{ fontSize: '0.8rem', fontFamily: 'monospace' }}>{p.razorpayPaymentId || 'N/A'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTACT ENQUIRIES TABLE */}
        {activeTab === 'enquiries' && (
          <div>
            {enquiriesError && (
              <div className="alert-box alert-error" style={{ marginBottom: '20px' }}>
                <AlertCircle size={20} /> {enquiriesError}
              </div>
            )}

            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 12px auto' }} />
                <p>Loading contact enquiries...</p>
              </div>
            ) : enquiriesError ? null : enquiries.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No contact enquiries received yet.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Message</th>
                      <th>Received Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.map((e) => (
                      <tr key={e.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>#{e.id}</td>
                        <td><strong>{e.name || (e.user && e.user.name)}</strong></td>
                        <td>{e.email || (e.user && e.user.email)}</td>
                        <td>{e.phone || (e.user && e.user.phone)}</td>
                        <td style={{ maxWidth: '350px', whiteSpace: 'pre-wrap', fontSize: '0.88rem' }}>{e.message}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {e.createdAt ? new Date(e.createdAt).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REGISTERED CLIENTS TABLE */}
        {activeTab === 'clients' && (
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>
                <Loader2 className="animate-spin" size={32} style={{ margin: '0 auto 12px auto' }} />
                <p>Loading registered clients...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '40px' }}>
                <p style={{ color: 'var(--text-secondary)' }}>No registered clients found in MySQL database.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Client Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Total Bookings</th>
                      <th>Last Booking Date</th>
                      <th>Registration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((c) => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>#{c.id}</td>
                        <td><strong>{c.name}</strong></td>
                        <td>{c.email}</td>
                        <td>{c.phone || 'N/A'}</td>
                        <td>
                          <span className="badge badge-confirmed">{c.totalBookings} Booking(s)</span>
                        </td>
                        <td>{c.lastBookingDate ? c.lastBookingDate : 'No bookings yet'}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {c.registeredDate ? new Date(c.registeredDate).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
