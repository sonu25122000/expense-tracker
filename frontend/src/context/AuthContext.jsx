import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setAuthToken, setUnauthorizedHandler } from '../api/client';
import { getAuthStatus, setupAccount, login as loginRequest } from '../api/auth';
import { useSettings } from './SettingsContext';

const TOKEN_KEY = 'expense_tracker_token';
const USERNAME_KEY = 'expense_tracker_username';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { serverUrl } = useSettings();
  const [token, setToken] = useState('');
  const [username, setUsername] = useState('');
  const [accountConfigured, setAccountConfigured] = useState(null); // null = unknown
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState('');

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

  const refreshStatus = useCallback(async () => {
    if (!serverUrl) return;
    setChecking(true);
    setError('');
    try {
      const status = await getAuthStatus();
      setAccountConfigured(status.configured);
    } catch (err) {
      setError('Could not reach the server to check account status.');
    } finally {
      setChecking(false);
    }
  }, [serverUrl]);

  useEffect(() => {
    if (!serverUrl) {
      setChecking(false);
      return;
    }
    const storedToken = localStorage.getItem(TOKEN_KEY) || '';
    const storedUsername = localStorage.getItem(USERNAME_KEY) || '';
    if (storedToken) {
      setToken(storedToken);
      setUsername(storedUsername);
      setAuthToken(storedToken);
    }
    refreshStatus();
  }, [serverUrl, refreshStatus]);

  const handleSetup = useCallback(async (user, pass) => {
    const data = await setupAccount(user, pass);
    setToken(data.token);
    setUsername(data.username);
    setAuthToken(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USERNAME_KEY, data.username);
    setAccountConfigured(true);
  }, []);

  const handleLogin = useCallback(async (user, pass) => {
    const data = await loginRequest(user, pass);
    setToken(data.token);
    setUsername(data.username);
    setAuthToken(data.token);
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USERNAME_KEY, data.username);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        isAuthenticated: Boolean(token),
        accountConfigured,
        checking,
        error,
        setup: handleSetup,
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
