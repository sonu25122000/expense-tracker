import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setServerUrl as setApiServerUrl } from '../api/client';

const SERVER_URL_KEY = 'expense_tracker_server_url';
const CURRENCY_KEY = 'expense_tracker_currency';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [serverUrl, setServerUrlState] = useState('');
  const [currency, setCurrencyState] = useState('₹');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const storedUrl = localStorage.getItem(SERVER_URL_KEY) || '';
    const storedCurrency = localStorage.getItem(CURRENCY_KEY) || '₹';
    setServerUrlState(storedUrl);
    setApiServerUrl(storedUrl); // '' is valid: means same-origin
    setCurrencyState(storedCurrency);
    setLoaded(true);
  }, []);

  const updateServerUrl = useCallback((url) => {
    setServerUrlState(url);
    setApiServerUrl(url);
    localStorage.setItem(SERVER_URL_KEY, url);
  }, []);

  const updateCurrency = useCallback((symbol) => {
    setCurrencyState(symbol);
    localStorage.setItem(CURRENCY_KEY, symbol);
  }, []);

  return (
    <SettingsContext.Provider
      value={{ serverUrl, updateServerUrl, currency, updateCurrency, loaded }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
