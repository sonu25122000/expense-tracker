import { apiClient } from './client';

export async function getAuthStatus() {
  const { data } = await apiClient.get('/auth/status');
  return data;
}

export async function setupAccount(username, password) {
  const { data } = await apiClient.post('/auth/setup', { username, password });
  return data;
}

export async function login(username, password) {
  const { data } = await apiClient.post('/auth/login', { username, password });
  return data;
}
