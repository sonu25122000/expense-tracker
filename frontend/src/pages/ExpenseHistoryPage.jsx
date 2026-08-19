import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import ChipSelector from '../components/ChipSelector';
import ExpenseListItem from '../components/ExpenseListItem';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { listExpenses, deleteExpense } from '../api/expenses';
import { formatCurrency } from '../utils/format';
import { useSettings } from '../context/SettingsContext';

const PAYMENT_METHODS = ['All', 'Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

export default function ExpenseHistoryPage() {
  const navigate = useNavigate();
  const { currency } = useSettings();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);

  const filters = useMemo(
    () => ({
      startDate: customStart || undefined,
      endDate: customEnd || undefined,
      paymentMethod: paymentMethod === 'All' ? undefined : paymentMethod,
      minAmount: minAmount || undefined,
      maxAmount: maxAmount || undefined,
      search: search || undefined,
    }),
    [customStart, customEnd, paymentMethod, minAmount, maxAmount, search]
  );

  const { data, isLoading } = useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => listExpenses(filters),
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
      <div className="filter-panel">
        <input
          className="text-input"
          placeholder="🔍 Search description or category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ margin: '12px 0' }}
        />
        <div className="form-row" style={{ margin: '8px 0' }}>
          <input
            type="date"
            className="text-input"
            placeholder="From"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
          />
          <input
            type="date"
            className="text-input"
            placeholder="To"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
          />
        </div>
        <div style={{ margin: '8px 0' }}>
          <ChipSelector options={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />
        </div>
        <div className="form-row" style={{ marginBottom: 12 }}>
          <input
            className="text-input"
            type="number"
            placeholder="Min amount"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
          />
          <input
            className="text-input"
            type="number"
            placeholder="Max amount"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
          />
        </div>
      </div>

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
          <EmptyState title="No expenses found" message="Try adjusting your filters, or add a new expense." />
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
