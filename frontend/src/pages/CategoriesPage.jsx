import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import { listCategories, createCategory, deleteCategory } from '../api/categories';
import { iconForCategory } from '../theme';

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [newName, setNewName] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');

  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: listCategories });

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      setNewName('');
      setError('');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => setError(err?.response?.data?.message || err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (err) => {
      setPendingDelete(null);
      setError(err?.response?.data?.message || err.message);
    },
  });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createMutation.mutate(newName.trim());
  };

  return (
    <>
      <PageHeader title="Categories" back />
      <div className="app-content">
        <form className="form-row" onSubmit={handleAdd} style={{ marginBottom: 16 }}>
          <input
            className="text-input"
            placeholder="New category name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button
            type="submit"
            className="button button-primary"
            style={{ flex: '0 0 auto', width: 48 }}
            disabled={createMutation.isPending}
          >
            +
          </button>
        </form>
        {error && <div className="banner-error" style={{ marginBottom: 12 }}>{error}</div>}

        {isLoading ? (
          <div className="spinner" />
        ) : (
          categories?.map((cat) => (
            <div key={cat._id} className="list-row static">
              <div className="expense-icon">{iconForCategory(cat.name)}</div>
              <p style={{ flex: 1, fontWeight: 600 }}>{cat.name}</p>
              {cat.isDefault ? (
                <span className="category-badge">Default</span>
              ) : (
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setPendingDelete(cat)}
                  aria-label="Delete category"
                >
                  🗑️
                </button>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete category?"
        message={`"${pendingDelete?.name}" will be removed. This only works if no expenses use it.`}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => deleteMutation.mutate(pendingDelete._id)}
      />
    </>
  );
}
