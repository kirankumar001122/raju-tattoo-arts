import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, AlertCircle, Loader2, KeyRound } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const userData = await login(email, password);
      if (userData.role !== 'ROLE_ADMIN' && userData.role !== 'ADMIN') {
        setErrorMessage('Admin access required.');
        return;
      }
      navigate('/admin');
    } catch (err) {
      setErrorMessage('Admin access required.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding" style={{ paddingTop: '130px', minHeight: '80vh', display: 'flex', alignItems: 'center' }}>
      <div className="container" style={{ maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            padding: '16px',
            borderRadius: '50%',
            backgroundColor: 'rgba(201, 162, 39, 0.1)',
            border: '1px solid var(--border-gold)',
            marginBottom: '16px'
          }}>
            <Shield className="text-gold" size={36} />
          </div>
          <h1 className="section-title" style={{ fontSize: '1.8rem', marginBottom: '8px' }}>
            STUDIO <span className="text-gold">ADMIN LOGIN</span>
          </h1>
          <p className="section-subtitle" style={{ fontSize: '0.88rem', marginBottom: 0 }}>
            Restricted Access Portal for Authorized Studio Administrator
          </p>
        </div>

        <div className="card" style={{ padding: '36px', borderColor: 'var(--border-gold)' }}>
          {errorMessage && (
            <div className="alert-box alert-error" style={{ marginBottom: '20px' }}>
              <AlertCircle size={20} style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '0.9rem' }}>{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Mail size={14} className="text-gold" /> Admin Email Address *
              </label>
              <input
                type="email"
                name="admin_login_email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your admin email"
                autoComplete="off"
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <KeyRound size={14} className="text-gold" /> Admin Password *
              </label>
              <input
                type="password"
                name="admin_login_password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                autoComplete="new-password"
                required
                className="form-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.98rem', marginTop: '10px' }}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Authenticating Admin...
                </>
              ) : (
                <>
                  <Shield size={18} /> LOGIN TO ADMIN DASHBOARD
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
