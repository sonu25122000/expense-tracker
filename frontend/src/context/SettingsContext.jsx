import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { setServerUrl as setApiServerUrl } from '../api/client';
import { DEFAULT_SERVER_URL } from '../config';

const SERVER_URL_KEY = 'expense_tracker_server_url';
const CURRENCY = '₹';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [serverUrl, setServerUrlState] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let storedUrl = localStorage.getItem(SERVER_URL_KEY) || '';
    if (!storedUrl && Capacitor.isNativePlatform() && DEFAULT_SERVER_URL) {
      storedUrl = DEFAULT_SERVER_URL;
    }
    setServerUrlState(storedUrl);
    setApiServerUrl(storedUrl); // '' is valid: means same-origin
    setLoaded(true);
  }, []);

  const updateServerUrl = useCallback((url) => {
    setServerUrlState(url);
    setApiServerUrl(url);
    localStorage.setItem(SERVER_URL_KEY, url);
  }, []);

  return (
    <SettingsContext.Provider value={{ serverUrl, updateServerUrl, currency: CURRENCY, loaded }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
