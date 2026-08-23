import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { createBookingOrder, verifyPaymentAndBook, updateBookingFcmToken } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { requestNotificationPermissionAndGetToken } from '../firebase';
import { Calendar, CheckCircle2, AlertCircle, Loader2, List, ArrowRight, CreditCard, ShieldCheck, Bell } from 'lucide-react';

const Booking = () => {
  const [searchParams] = useSearchParams();
  const initialService = searchParams.get('service') || '';
  const { user } = useAuth();

  const [fcmToken, setFcmToken] = useState('');
  const [fcmPermissionGranted, setFcmPermissionGranted] = useState(false);
  const [fcmLoading, setFcmLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerName: user ? user.name : '',
    phone: user ? user.phone : '',
    email: user ? user.email : '',
    service: initialService || 'Tattoo Design & Tattooing',
    appointmentDate: '',
    appointmentTime: '12:00',
    requirements: '',
    additionalNotes: '',
  });

  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [successResponse, setSuccessResponse] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (initialService) {
      setFormData((prev) => ({ ...prev, service: initialService }));
    }
  }, [initialService]);

  const handleEnableNotifications = async () => {
    setFcmLoading(true);
    try {
      const token = await requestNotificationPermissionAndGetToken();
      if (token) {
        setFcmToken(token);
        setFcmPermissionGranted(true);
      }
    } catch (err) {
      console.warn('FCM Notification permission error:', err);
    } finally {
      setFcmLoading(false);
    }
  };

  const getServiceDisplayPrice = (serviceName) => {
    if (!serviceName) return '300';
    const s = serviceName.toLowerCase();
    if (s.includes('removal')) return '1,800';
    if (s.includes('cover')) return '1,200';
    if (s.includes('piercing')) return '800';
    if (s.includes('custom')) return '600';
    if (s.includes('aftercare')) return '500';
    if (s.includes('consultation')) return '300';
    if (s.includes('design') || s.includes('tattooing')) return '300';
    return '300';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStep('Creating payment order...');
    setErrorMessage('');
    setPaymentError('');
    setFieldErrors({});
    setSuccessResponse(null);

    // Form field validations
    const errors = {};
    if (!formData.customerName || !formData.customerName.trim()) {
      errors.customerName = 'Full name is required';
    }
    if (!formData.phone || !formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }
    if (!formData.email || !formData.email.trim()) {
      errors.email = 'Email address is required';
    }
    if (!formData.appointmentDate) {
      errors.appointmentDate = 'Please select an appointment date';
    }
    if (!formData.appointmentTime) {
      errors.appointmentTime = 'Please select an appointment time';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMessage('Please complete all required fields before proceeding to payment.');
      setLoading(false);
      setLoadingStep('');
      return;
    }

    try {
      // Step 1: Create Razorpay Order from backend BEFORE creating any booking record in MySQL
      const orderRes = await createBookingOrder(formData);
      const orderData = orderRes.data;

      setLoadingStep('Opening Razorpay Checkout...');

      // Step 2: Ensure Razorpay SDK is loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay Checkout SDK. Please check connection.'));
          document.body.appendChild(script);
        });
      }

      // Step 3: Configure Razorpay Standard Checkout Popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Raju Tattoo Arts',
        description: `Payment for ${orderData.service || 'Appointment'}`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.customerName,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#C9A227', // Studio gold theme
        },
        handler: async function (response) {
          // Step 4: After payment modal completion, verify HMAC-SHA256 signature server-side & create MySQL records
          try {
            setLoading(true);
            setLoadingStep('Verifying payment & saving appointment...');

            const verifyRes = await verifyPaymentAndBook({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              booking: formData,
            });

            setSuccessResponse(verifyRes.data);
            const createdBookingId = verifyRes.data ? verifyRes.data.bookingId : null;
            if (createdBookingId && fcmToken) {
              try {
                await updateBookingFcmToken(createdBookingId, fcmToken);
              } catch (tErr) {
                console.warn('FCM token registration warning:', tErr);
              }
            }

            setFormData({
              customerName: user ? user.name : '',
              phone: user ? user.phone : '',
              email: user ? user.email : '',
              service: 'Tattoo Design & Tattooing',
              appointmentDate: '',
              appointmentTime: '12:00',
              requirements: '',
              additionalNotes: '',
            });
          } catch (vErr) {
            setPaymentError(vErr.message || 'Payment signature verification failed.');
          } finally {
            setLoading(false);
            setLoadingStep('');
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setLoadingStep('');
            setPaymentError('Payment was cancelled or closed before completion. Your appointment form details are preserved below. Please click Submit & Pay to try again.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (resp) {
        setLoading(false);
        setLoadingStep('');
        setPaymentError(resp.error ? resp.error.description : 'Payment process failed.');
      });

      rzp.open();
    } catch (err) {
      setLoading(false);
      setLoadingStep('');
      setErrorMessage(err.message || 'Failed to initialize payment order. Please try again.');
    }
  };

  // Initiate Razorpay Standard Checkout
  const handlePayNow = async (bookingId) => {
    setPaymentLoading(true);
    setPaymentError('');
    setPaymentSuccessData(null);

    try {
      // 1. Create Razorpay order via Spring Boot backend REST API
      const orderRes = await createPaymentOrder(bookingId);
      const orderData = orderRes.data;

      // 2. Load Razorpay Checkout SDK dynamically if not present
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = () => reject(new Error('Failed to load Razorpay Checkout SDK.'));
          document.body.appendChild(script);
        });
      }

      // 3. Setup Razorpay Standard Checkout options
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Raju Tattoo Arts',
        description: `Payment for ${orderData.service || 'Appointment'} #${bookingId}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.customerName || (user ? user.name : ''),
          email: orderData.email || (user ? user.email : ''),
          contact: orderData.phone || (user ? user.phone : ''),
        },
        theme: {
          color: '#C9A227', // Luxury studio gold
        },
        handler: async function (response) {
          // 4. Verify Razorpay HMAC signature via Spring Boot backend
          try {
            setPaymentLoading(true);
            const verifyRes = await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: bookingId,
            });
            setPaymentSuccessData(verifyRes.data);
          } catch (vErr) {
            setPaymentError(vErr.message || 'Payment signature verification failed.');
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
      rzp.on('payment.failed', function (resp) {
        setPaymentError(resp.error ? resp.error.description : 'Payment failed.');
        setPaymentLoading(false);
      });

      rzp.open();
    } catch (err) {
      setPaymentError(err.message || 'Failed to initialize Razorpay payment order.');
      setPaymentLoading(false);
    }
  };

  // Simulation test payment verification for local development
  const handleSimulatedTestPayment = async (bookingId) => {
    setPaymentLoading(true);
    setPaymentError('');
    try {
      const orderRes = await createPaymentOrder(bookingId);
      const orderData = orderRes.data;
      const testPaymentId = 'pay_test_' + Math.floor(Math.random() * 10000000);
      const testSig = 'sig_test_verified';

      const verifyRes = await verifyPayment({
        razorpay_order_id: orderData.orderId,
        razorpay_payment_id: testPaymentId,
        razorpay_signature: testSig,
        bookingId: bookingId,
      });

      setPaymentSuccessData(verifyRes.data);
    } catch (err) {
      setPaymentError(err.message || 'Test payment verification failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="section-padding" style={{ paddingTop: '120px' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 className="section-title">BOOK AN <span className="text-gold">APPOINTMENT</span></h1>
          <p className="section-subtitle">
            Reserve your session with Raju Tattoo Arts. Fill in your details below and complete payment via Razorpay.
          </p>
        </div>

        {/* PAYMENT & APPOINTMENT SUCCESSFUL RECEIPT BANNER */}
        {successResponse && (
          <div className="alert-box alert-success" style={{ padding: '28px', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '20px', borderColor: 'var(--accent-gold)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', color: 'var(--accent-gold)' }}>
              <ShieldCheck size={36} />
              <div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 800 }}>PAYMENT & APPOINTMENT SUCCESSFUL</h3>
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <span className="badge badge-completed" style={{ fontSize: '0.82rem' }}>PAYMENT: PAID</span>
                  <span className="badge badge-pending" style={{ fontSize: '0.82rem' }}>BOOKING: PENDING ADMIN CONFIRMATION</span>
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'rgba(0,0,0,0.4)',
              padding: '20px 24px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.95rem',
              color: 'var(--text-primary)',
              lineHeight: 1.8
            }}>
              <p><strong>Booking ID:</strong> <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '1.1rem' }}>#{successResponse.bookingId}</span></p>
              <p><strong>Customer Name:</strong> {successResponse.customerName}</p>
              <p><strong>Customer Email:</strong> {successResponse.email}</p>
              <p><strong>Service Requested:</strong> {successResponse.service}</p>
              <p><strong>Scheduled Appointment:</strong> {successResponse.appointmentDate} at {successResponse.appointmentTime}</p>
              <p><strong>Amount Paid:</strong> <span style={{ color: '#10B981', fontWeight: 800, fontSize: '1.1rem' }}>₹{successResponse.amount}</span></p>
              <p><strong>Razorpay Payment ID:</strong> <code>{successResponse.razorpayPaymentId}</code></p>
              <p><strong>Razorpay Order ID:</strong> <code>{successResponse.razorpayOrderId}</code></p>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              A payment confirmation and appointment receipt email has been dispatched to <strong>{successResponse.email}</strong>.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/track" className="btn-primary" style={{ padding: '12px 28px', fontSize: '0.92rem' }}>
                <List size={18} /> TRACK APPOINTMENT STATUS
              </Link>
              <button
                onClick={() => setSuccessResponse(null)}
                className="btn-secondary"
                style={{ padding: '12px 24px', fontSize: '0.9rem' }}
              >
                Book Another Appointment
              </button>
            </div>
          </div>
        )}

        {/* PAYMENT ERROR BANNER */}
        {paymentError && (
          <div className="alert-box alert-error" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ fontSize: '1rem', display: 'block', marginBottom: '4px' }}>PAYMENT CANCELLED / FAILED:</strong>
              <span>{paymentError}</span>
            </div>
          </div>
        )}

        {/* GENERAL FORM ERROR BANNER */}
        {errorMessage && (
          <div className="alert-box alert-error" style={{ marginBottom: '24px', padding: '16px 20px' }}>
            <AlertCircle size={24} style={{ flexShrink: 0 }} />
            <div>
              <strong>Submission Error:</strong> {errorMessage}
            </div>
          </div>
        )}

        {/* BOOKING & PAYMENT FORM */}
        <div className="card" style={{ padding: '40px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              
              {/* Full Name */}
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleChange}
                  placeholder="e.g. Ramesh Kumar"
                  required
                  className="form-input"
                />
                {fieldErrors.customerName && <p className="form-error">{fieldErrors.customerName}</p>}
              </div>

              {/* Phone Number */}
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  required
                  className="form-input"
                />
                {fieldErrors.phone && <p className="form-error">{fieldErrors.phone}</p>}
              </div>

              {/* Email Address */}
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. client@example.com"
                  required
                  className="form-input"
                />
                {fieldErrors.email && <p className="form-error">{fieldErrors.email}</p>}
              </div>

              {/* Service Selection */}
              <div className="form-group">
                <label className="form-label">Service Choice *</label>
                <select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="Tattoo Design & Tattooing">Tattoo Design & Tattooing — ₹300</option>
                  <option value="Tattoo Consultation">Tattoo Consultation — ₹300</option>
                  <option value="Aftercare Guidance">Aftercare Guidance — ₹500</option>
                  <option value="Custom Tattoos">Custom Tattoos — ₹600</option>
                  <option value="Piercing">Piercing — ₹800</option>
                  <option value="Cover Up Tattoo">Cover Up Tattoo — ₹1,200</option>
                  <option value="Tattoo Removal">Tattoo Removal — ₹1,800</option>
                </select>
              </div>

              {/* Appointment Date */}
              <div className="form-group">
                <label className="form-label">Appointment Date *</label>
                <input
                  type="date"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="form-input"
                />
                {fieldErrors.appointmentDate && <p className="form-error">{fieldErrors.appointmentDate}</p>}
              </div>

              {/* Preferred Time */}
              <div className="form-group">
                <label className="form-label">Preferred Time *</label>
                <input
                  type="time"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
                {fieldErrors.appointmentTime && <p className="form-error">{fieldErrors.appointmentTime}</p>}
              </div>
            </div>

            {/* Tattoo Requirements */}
            <div className="form-group">
              <label className="form-label">Tattoo Requirements & Idea Description</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                placeholder="Describe your tattoo idea, placement (e.g. forearm, chest), size (e.g. 4x4 inches), color preference, or custom design details..."
                className="form-textarea"
              />
            </div>

            {/* Additional Notes */}
            <div className="form-group">
              <label className="form-label">Additional Notes / Health Declarations</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={2}
                placeholder="Any skin sensitivities, allergies, or questions for artist..."
                className="form-textarea"
              />
            </div>

            {/* PUSH NOTIFICATIONS BANNER */}
            <div style={{
              backgroundColor: 'rgba(201, 162, 39, 0.06)',
              border: '1px solid var(--border-dark)',
              borderRadius: 'var(--radius-sm)',
              padding: '14px 18px',
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={18} className="text-gold" />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  Enable notifications to receive appointment updates.
                </span>
              </div>
              <button
                type="button"
                onClick={handleEnableNotifications}
                disabled={fcmPermissionGranted || fcmLoading}
                className="btn-secondary"
                style={{ padding: '6px 14px', fontSize: '0.82rem' }}
              >
                {fcmPermissionGranted ? '✓ Notifications Enabled' : (fcmLoading ? 'Enabling...' : 'Enable Notifications')}
              </button>
            </div>

            {/* DYNAMIC SERVICE PRICE SUMMARY BOX */}
            <div style={{
              backgroundColor: 'rgba(201, 162, 39, 0.08)',
              border: '1px solid var(--accent-gold)',
              borderRadius: 'var(--radius-sm)',
              padding: '16px 20px',
              marginTop: '20px',
              marginBottom: '20px',
              display: 'flex',
              justify: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SELECTED SERVICE</span>
                <strong style={{ fontSize: '1.05rem', color: 'var(--text-primary)' }}>{formData.service}</strong>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TOTAL PAYMENT AMOUNT</span>
                <strong style={{ fontSize: '1.35rem', color: '#10B981', fontWeight: 800 }}>₹{getServiceDisplayPrice(formData.service)}</strong>
              </div>
            </div>

            {/* Submit & Pay Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', marginTop: '10px', backgroundColor: 'var(--accent-gold)', color: '#000' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> {loadingStep || 'Processing Payment...'}
                </>
              ) : (
                <>
                  <CreditCard size={20} /> SUBMIT APPOINTMENT REQUEST & PAY (₹{getServiceDisplayPrice(formData.service)})
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Booking;
