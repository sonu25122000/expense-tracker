import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import ExpenseListItem from '../components/ExpenseListItem';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { listExpenses, deleteExpense } from '../api/expenses';
import { formatCurrency } from '../utils/format';
import { useSettings } from '../context/SettingsContext';

export default function ExpenseHistoryPage() {
  const navigate = useNavigate();
  const { currency } = useSettings();
  const queryClient = useQueryClient();
  const [pendingDelete, setPendingDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', {}],
    queryFn: () => listExpenses(),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });

  const expenses = data?.expenses || [];

  return (
    <>
      <PageHeader title="Expense History" />

      <div className="total-bar">
        <span>
          {data?.count ?? 0} transaction{(data?.count ?? 0) === 1 ? '' : 's'}
        </span>
        <span className="total-value">{formatCurrency(data?.total ?? 0, currency)}</span>
      </div>

      <div className="app-content" style={{ paddingTop: 16 }}>
        {isLoading ? (
          <div className="spinner" />
        ) : expenses.length === 0 ? (
          <EmptyState title="No expenses yet" message="Add your first expense to see it here." />
        ) : (
          expenses.map((item) => (
            <ExpenseListItem
              key={item._id}
              expense={item}
              onPress={() => navigate(`/expenses/${item._id}`)}
              onEdit={() => navigate(`/expenses/${item._id}/edit`)}
              onDelete={() => setPendingDelete(item)}
            />
          ))
        )}
      </div>

      <ConfirmModal
        open={!!pendingDelete}
        title="Delete this expense?"
        message={pendingDelete ? `${pendingDelete.category} · ${formatCurrency(pendingDelete.amount, currency)}` : ''}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => deleteMutation.mutate(pendingDelete._id)}
      />
    </>
  );
}
