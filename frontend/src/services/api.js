import axios from 'axios';

// Base API configuration connecting to Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://raju-tattoo-backend.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to attach JWT Bearer token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('raju_tattoo_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clear error handling preserving HTTP status code
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data || {};
      const message = typeof errorData === 'string'
        ? errorData
        : (errorData.message || `Request failed with status ${status}`);
      return Promise.reject({ status, message, raw: errorData });
    }
    return Promise.reject({
      status: 0,
      message: 'Unable to connect to server. Please check backend status.',
    });
  }
);

// Auth Services
export const loginUser = (credentials) => api.post('/auth/login', credentials);
export const registerUser = (userData) => api.post('/auth/register', userData);
export const getCurrentUser = () => api.get('/auth/me');
export const getMyProfile = () => api.get('/users/me');

// Booking Services
export const createBooking = (bookingData) => api.post('/bookings', bookingData);
export const getMyBookings = () => api.get('/bookings/my');
export const getAllBookings = () => api.get('/bookings');
export const getBookingById = (id) => api.get(`/bookings/${id}`);
export const trackBooking = (bookingId, email) => 
  api.get(`/bookings/track?bookingId=${bookingId}&email=${encodeURIComponent(email)}`);
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status });

// Contact Services
export const createContactEnquiry = (enquiryData) => api.post('/contact', enquiryData);
export const getMyContactEnquiries = () => api.get('/contact/my');
export const getAllContactEnquiries = () => api.get('/contact');

// Admin Services
export const getRegisteredClients = () => api.get('/admin/clients');

// Payment Services
export const getRazorpayConfig = () => api.get('/payments/config');
export const createPaymentOrder = (bookingId) => api.post('/payments/create-order', { bookingId });
export const createBookingOrder = (bookingData) => api.post('/payments/create-booking-order', bookingData);
export const verifyPayment = (paymentData) => api.post('/payments/verify', paymentData);
export const verifyPaymentAndBook = (payload) => api.post('/payments/verify-and-book', payload);
export const getBookingPaymentStatus = (bookingId) => api.get(`/payments/booking/${bookingId}`);
export const getMyPayments = () => api.get('/payments/my');
export const getAdminPaymentMetrics = () => api.get('/payments/admin/metrics');

export default api;
