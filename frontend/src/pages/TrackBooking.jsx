import React, { useState } from 'react';
import { trackBooking, getBookingPaymentStatus, createPaymentOrder, verifyPayment } from '../services/api';
import { Search, Calendar, Clock, AlertCircle, CheckCircle2, XCircle, Loader2, Sparkles, CreditCard, ShieldCheck } from 'lucide-react';

const TrackBooking = () => {
  const [bookingId, setBookingId] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Payment state
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState('');

  const fetchPaymentDetails = async (id) => {
    try {
      const pRes = await getBookingPaymentStatus(id);
      setPaymentInfo(pRes.data);
    } catch (e) {
      console.error('Failed to fetch payment status', e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setBookingResult(null);
    setPaymentInfo(null);

    if (!bookingId || !email) {
      setErrorMessage('Please enter both Booking ID and Email.');
      setLoading(false);
      return;
    }

    try {
      const response = await trackBooking(bookingId.trim(), email.trim());
      setBookingResult(response.data);
      if (response.data && response.data.bookingId) {
        await fetchPaymentDetails(response.data.bookingId);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Unable to check your booking status right now. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayNow = async () => {
    if (!bookingResult) return;
    setPaymentLoading(true);
    setPaymentError('');

    try {
      const orderRes = await createPaymentOrder(bookingResult.bookingId);
      const orderData = orderRes.data;

      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
          document.body.appendChild(script);
        });
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Raju Tattoo Arts',
        description: `Payment for Appointment #${bookingResult.bookingId}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customerName || '',
          email: email.trim(),
          contact: orderData.phone || '',
        },
        theme: {
          color: '#C9A227',
        },
        handler: async function (resp) {
          try {
            setPaymentLoading(true);
            await verifyPayment({
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature,
              bookingId: bookingResult.bookingId,
            });
            setPaymentSuccess(true);
            await fetchPaymentDetails(bookingResult.bookingId);
          } catch (vErr) {
            setPaymentError(vErr.message || 'Payment signature verification failed');
          } finally {
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (r) {
        setPaymentError(r.error ? r.error.description : 'Payment failed');
        setPaymentLoading(false);
      });
      rzp.open();
    } catch (err) {
      setPaymentError(err.message || 'Failed to initiate Razorpay checkout');
      setPaymentLoading(false);
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
      <div className="container" style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="section-title">TRACK YOUR <span className="text-gold">APPOINTMENT</span></h1>
          <p className="section-subtitle">
            Enter your Booking ID and Email address to view the latest status of your studio session.
          </p>
        </div>

        {/* Search Form Card */}
        <div className="card" style={{ padding: '36px', marginBottom: '32px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Booking ID *</label>
                <input
                  type="text"
                  value={bookingId}
                  onChange={(e) => setBookingId(e.target.value)}
                  placeholder="e.g. 12"
                  required
                  className="form-input"
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  required
                  className="form-input"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Checking Database...
                </>
              ) : (
                <>
                  <Search size={18} /> CHECK STATUS
                </>
              )}
            </button>
          </form>
        </div>

        {/* ERROR MESSAGE BANNER */}
        {errorMessage && (
          <div className="alert-box alert-error">
            <AlertCircle size={22} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.95rem' }}>{errorMessage}</div>
          </div>
        )}

        {/* RESULT STATUS CARD */}
        {bookingResult && (
          <div className="card" style={{ padding: '36px', borderColor: 'var(--border-gold)', position: 'relative' }}>
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
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: '1px' }}>APPOINTMENT TRACKER</span>
                <h2 style={{ fontSize: '1.8rem', color: 'var(--accent-gold)', fontWeight: 800 }}>
                  BOOKING #{bookingResult.bookingId}
                </h2>
              </div>
              <div>{getStatusBadge(bookingResult.status)}</div>
            </div>

            {/* Details */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Service Requested</span>
                <h4 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{bookingResult.service}</h4>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Scheduled Appointment</span>
                <h4 style={{ fontSize: '1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={16} className="text-gold" /> {bookingResult.appointmentDate} at {bookingResult.appointmentTime}
                </h4>
              </div>

              <div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Payment Status</span>
                <div style={{ marginTop: '4px' }}>
                  {paymentInfo && paymentInfo.paymentStatus === 'PAID' ? (
                    <span className="badge badge-completed" style={{ fontSize: '0.88rem' }}>
                      <ShieldCheck size={14} style={{ display: 'inline', marginRight: '4px' }} /> PAID (₹{paymentInfo.amount})
                    </span>
                  ) : (
                    <span className="badge badge-pending" style={{ fontSize: '0.88rem' }}>
                      UNPAID / PENDING
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* PAY NOW BUTTON IF UNPAID */}
            {paymentInfo && paymentInfo.paymentStatus !== 'PAID' && (
              <div style={{ marginBottom: '20px', padding: '16px', backgroundColor: 'rgba(201, 162, 39, 0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-gold)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>Payment Required</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Complete your deposit payment to lock in your slot.</p>
                  </div>

                  <button
                    onClick={handlePayNow}
                    disabled={paymentLoading}
                    className="btn-primary"
                    style={{ padding: '10px 24px', fontSize: '0.9rem' }}
                  >
                    {paymentLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={16} /> Opening Razorpay...
                      </>
                    ) : (
                      <>
                        <CreditCard size={16} /> PAY NOW WITH RAZORPAY
                      </>
                    )}
                  </button>
                </div>
                {paymentError && <p style={{ color: '#EF4444', fontSize: '0.85rem', marginTop: '8px' }}>{paymentError}</p>}
              </div>
            )}

            {/* Status Message Box */}
            <div style={{
              backgroundColor: 'rgba(201, 162, 39, 0.08)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-sm)',
              padding: '20px',
              marginTop: '16px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <Sparkles size={18} className="text-gold" />
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-gold)' }}>STATUS UPDATE</span>
              </div>
              <p style={{ color: 'var(--text-primary)', fontSize: '0.98rem', lineHeight: 1.6 }}>
                "{getStatusMessage(bookingResult.status)}"
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackBooking;
