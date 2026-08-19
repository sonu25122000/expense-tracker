import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import ConfirmModal from '../components/ConfirmModal';
import { getExpense, deleteExpense } from '../api/expenses';
import { formatCurrency, formatDate, formatDateTime } from '../utils/format';
import { useSettings } from '../context/SettingsContext';
import { iconForCategory } from '../theme';

export default function ExpenseDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currency } = useSettings();
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: expense, isLoading } = useQuery({ queryKey: ['expense', id], queryFn: () => getExpense(id) });

  const deleteMutation = useMutation({
    mutationFn: () => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/history');
    },
  });

  if (isLoading || !expense) {
    return (
      <>
        <PageHeader title="Expense Details" back />
        <div className="app-content">
          <div className="spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Expense Details" back />
      <div className="app-content">
        <div className="card" style={{ textAlign: 'center', marginBottom: 16 }}>
          <div className="expense-icon" style={{ margin: '0 auto 12px', width: 56, height: 56, fontSize: 24 }}>
            {iconForCategory(expense.category)}
          </div>
          <div style={{ fontSize: 28, fontWeight: 700 }}>{formatCurrency(expense.amount, currency)}</div>
          <div style={{ color: 'var(--text-secondary)', marginTop: 4 }}>{expense.category}</div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <div className="detail-row">
            <span className="detail-label">Date</span>
            <span className="detail-value">{formatDate(expense.date)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Payment Method</span>
            <span className="detail-value">{expense.paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Description</span>
            <span className="detail-value">{expense.description || '—'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Added on</span>
            <span className="detail-value">{formatDateTime(expense.createdAt)}</span>
          </div>
          {expense.updatedAt !== expense.createdAt && (
            <div className="detail-row">
              <span className="detail-label">Last updated</span>
              <span className="detail-value">{formatDateTime(expense.updatedAt)}</span>
            </div>
          )}
        </div>

        {expense.receiptUrl && (
          <div className="card" style={{ marginBottom: 16 }}>
            <p style={{ fontWeight: 600, marginTop: 0 }}>Receipt</p>
            <img
              src={expense.receiptUrl}
              alt="Receipt"
              style={{ width: '100%', maxHeight: 320, objectFit: 'contain', borderRadius: 'var(--radius-md)' }}
            />
          </div>
        )}

        <div className="form-row">
          <button className="button button-primary" onClick={() => navigate(`/expenses/${id}/edit`)}>
            ✏️ Edit
          </button>
          <button className="button button-danger" onClick={() => setConfirmOpen(true)}>
            🗑️ Delete
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete this expense?"
        message="This action cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
      />
    </>
  );
}
