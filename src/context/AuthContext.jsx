import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_ADMIN_USERS } from '../data/mockData';
import api from './api';

const defaultAuthContext = {
  currentUser: null,
  adminUser: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  updateProfile: () => {},
};

const AuthContext = createContext(defaultAuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('sumilux_admin_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('sumilux_admin_token') || null;
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sumilux_admin_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sumilux_admin_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('sumilux_admin_token', token);
    } else {
      localStorage.removeItem('sumilux_admin_token');
    }
  }, [token]);

  // Global Auth Expiration Listener
  useEffect(() => {
    const handleAuthExpired = () => {
      setCurrentUser(null);
      setToken(null);
    };
    window.addEventListener('auth-expired', handleAuthExpired);
    return () => window.removeEventListener('auth-expired', handleAuthExpired);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/api/auth/admin-login', { email, password });
    if (response.data.status) {
      setCurrentUser(response.data.user);
      setToken(response.data.token);
      return response.data;
    }
    throw new Error(response.data.message || 'Login failed');
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('sumilux_admin_user');
    localStorage.removeItem('sumilux_admin_token');
  };

  const updateProfile = (data) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminUser: currentUser,
        token,
        isAuthenticated: !!currentUser,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context || defaultAuthContext;
};

export default AuthContext;
