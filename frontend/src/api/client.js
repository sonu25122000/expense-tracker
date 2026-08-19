import axios from 'axios';

export const apiClient = axios.create({ timeout: 20000 });

let currentServerUrl = '';

export function setServerUrl(url) {
  currentServerUrl = url ? url.replace(/\/+$/, '') : '';
  apiClient.defaults.baseURL = currentServerUrl ? `${currentServerUrl}/api` : undefined;
}

export function getServerUrl() {
  return currentServerUrl;
}
