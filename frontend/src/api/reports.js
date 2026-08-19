import { apiClient } from './client';

export async function getReport(period, date) {
  const { data } = await apiClient.get('/reports', { params: { period, date } });
  return data;
}
