import axios from 'axios';

export const apiClient = axios.create({ timeout: 20000 });

let currentServerUrl = '';
let currentToken = '';
let onUnauthorized = null;

export function setServerUrl(url) {
  currentServerUrl = url ? url.replace(/\/+$/, '') : '';
  apiClient.defaults.baseURL = currentServerUrl ? `${currentServerUrl}/api` : undefined;
}

export function getServerUrl() {
  return currentServerUrl;
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
