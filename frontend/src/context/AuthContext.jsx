import React, { createContext, useState, useEffect, useContext } from 'react';
import { loginUser, registerUser, getCurrentUser } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('raju_tattoo_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchCurrentUser = async () => {
    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch (err) {
      console.error('Session validation failed:', err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await loginUser({ email, password });
    const { token: jwtToken, ...userData } = response.data;
    localStorage.setItem('raju_tattoo_token', jwtToken);
    localStorage.setItem('raju_tattoo_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return response.data;
  };

  const register = async (name, email, password, phone) => {
    const response = await registerUser({ name, email, password, phone });
    const { token: jwtToken, ...userData } = response.data;
    localStorage.setItem('raju_tattoo_token', jwtToken);
    localStorage.setItem('raju_tattoo_user', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('raju_tattoo_token');
    localStorage.removeItem('raju_tattoo_user');
    setToken('');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
