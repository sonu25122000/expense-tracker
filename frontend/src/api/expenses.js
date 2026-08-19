import { apiClient } from './client';

function buildFormData(fields, receiptFile) {
  const form = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      form.append(key, String(value));
    }
  });
  if (receiptFile instanceof File) {
    form.append('receipt', receiptFile);
  } else if (receiptFile === null) {
    form.append('removeReceipt', 'true');
  }
  return form;
}

export async function listExpenses(filters = {}) {
  const params = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params[key] = value;
  });
  const { data } = await apiClient.get('/expenses', { params });
  return data;
}

export async function getExpense(id) {
  const { data } = await apiClient.get(`/expenses/${id}`);
  return data;
}

export async function createExpense(fields, receiptFile) {
  const form = buildFormData(fields, receiptFile);
  const { data } = await apiClient.post('/expenses', form);
  return data;
}

export async function updateExpense(id, fields, receiptFile) {
  const form = buildFormData(fields, receiptFile);
  const { data } = await apiClient.put(`/expenses/${id}`, form);
  return data;
}

export async function deleteExpense(id) {
  const { data } = await apiClient.delete(`/expenses/${id}`);
  return data;
}
