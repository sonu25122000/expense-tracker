import axios from 'axios';

export const apiClient = axios.create({ timeout: 20000 });

let currentServerUrl = '';
let currentToken = '';
let onUnauthorized = null;

export function setServerUrl(url) {
  currentServerUrl = url ? url.replace(/\/+$/, '') : '';
  // Blank = same-origin (relative /api) — used for the browser/PWA build, where
  // the backend either serves this app directly or the dev server proxies /api.
  apiClient.defaults.baseURL = currentServerUrl ? `${currentServerUrl}/api` : '/api';
}

// Absolute origin to use for non-axios requests (e.g. plain fetch() for exports).
// Falls back to the page's own origin when no explicit server URL is set.
export function getServerUrl() {
  return currentServerUrl || window.location.origin;
}

export function setAuthToken(token) {
  currentToken = token || '';
}

export function getAuthToken() {
  return currentToken;
}

export function setUnauthorizedHandler(handler) {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);
