import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { register as registerRequest, login as loginRequest } from '../api/auth';

const TOKEN_KEY = 'expense_tracker_token';
const USERNAME_KEY = 'expense_tracker_username';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [loaded, setLoaded] = useState(false);

  const logout = useCallback(() => {
    setToken('');
    setUsername('');
    setAuthToken('');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USERNAME_KEY);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY) || '';
    const storedUsername = localStorage.getItem(USERNAME_KEY) || '';
    if (storedToken) {
      setToken(storedToken);
      setUsername(storedUsername);
      setAuthToken(storedToken);
    }
    setLoaded(true);
  }, []);

  const persistSession = (data) => {
    setToken(data.token);
    setUsername(data.username);
    setAuthToken(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USERNAME_KEY, data.username);
  };

  const handleRegister = useCallback(async (user, pass) => {
    const data = await registerRequest(user, pass);
    persistSession(data);
  }, []);

  const handleLogin = useCallback(async (user, pass) => {
    const data = await loginRequest(user, pass);
    persistSession(data);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: Boolean(token),
        loaded,
        register: handleRegister,
        login: handleLogin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
