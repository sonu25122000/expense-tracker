import { apiClient } from './client';

export async function listCategories() {
  const { data } = await apiClient.get('/categories');
  return data;
}

export async function createCategory(name) {
  const { data } = await apiClient.post('/categories', { name });
  return data;
}

export async function deleteCategory(id) {
  const { data } = await apiClient.delete(`/categories/${id}`);
  return data;
}
