import { apiClient } from './client';

export async function register(username, password) {
  const { data } = await apiClient.post('/auth/register', { username, password });
  return data;
}

export async function login(username, password) {
  const { data } = await apiClient.post('/auth/login', { username, password });
  return data;
}
