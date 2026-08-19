import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../components/PageHeader';
import ChipSelector from '../components/ChipSelector';
import ReceiptPicker from '../components/ReceiptPicker';
import { listCategories } from '../api/categories';
import { createExpense, updateExpense, getExpense } from '../api/expenses';
import { toApiDateString } from '../utils/format';

const PAYMENT_METHODS = ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Other'];

export default function AddExpensePage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [date, setDate] = useState(toApiDateString(new Date()));
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [description, setDescription] = useState('');
  const [receiptFile, setReceiptFile] = useState(undefined); // undefined=unchanged, null=removed, File=new
  const [existingReceiptUrl, setExistingReceiptUrl] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [formError, setFormError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');

  const { data: categories } = useQuery({ queryKey: ['categories'], queryFn: listCategories });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const expense = await getExpense(id);
        setDate(toApiDateString(new Date(expense.date)));
        setAmount(String(expense.amount));
        setCategory(expense.category);
        setPaymentMethod(expense.paymentMethod);
        setDescription(expense.description || '');
        setExistingReceiptUrl(expense.receiptUrl);
      } catch (err) {
        setFormError('Could not load this expense.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  useEffect(() => {
    if (!isEdit && !category && categories?.length) {
      setCategory(categories[0].name);
    }
  }, [categories, isEdit, category]);

  const resetForm = () => {
    setDate(toApiDateString(new Date()));
    setAmount('');
    setCategory(categories?.[0]?.name || '');
    setPaymentMethod('Cash');
    setDescription('');
    setReceiptFile(undefined);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const fields = { date, amount: Number(amount), category, paymentMethod, description };
      if (isEdit) return updateExpense(id, fields, receiptFile);
      return createExpense(fields, receiptFile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
      if (isEdit) {
        navigate(-1);
      } else {
        resetForm();
        setSavedMessage('Expense added.');
        setTimeout(() => setSavedMessage(''), 2500);
      }
    },
    onError: (err) => setFormError(err?.response?.data?.message || err.message),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const numeric = Number(amount);
    if (!amount || Number.isNaN(numeric) || numeric <= 0) {
      setFormError('Enter an amount greater than 0.');
      return;
    }
    if (!category) {
      setFormError('Please select a category.');
      return;
    }
    mutation.mutate();
  };

  if (loading) {
    return (
      <>
        <PageHeader title="Edit Expense" back />
        <div className="app-content">
          <div className="spinner" />
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title={isEdit ? 'Edit Expense' : 'Add Expense'} back={isEdit} />
      <div className="app-content">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div>
              <span className="field-label" style={{ marginTop: 0 }}>
                Date
              </span>
              <input
                type="date"
                className="text-input"
                value={date}
                max={toApiDateString(new Date())}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>

            <div>
              <span className="field-label" style={{ marginTop: 0 }}>
                Amount
              </span>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                min="0"
                className="text-input amount-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-grid">
            <div>
              <span className="field-label">Category</span>
              <input
                type="text"
                className="text-input"
                placeholder="e.g. Food, Travel, Rent"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="category-suggestions"
                autoComplete="off"
              />
              <datalist id="category-suggestions">
                {(categories || []).map((cat) => (
                  <option key={cat._id || cat.name} value={cat.name} />
                ))}
              </datalist>
            </div>

            <div>
              <span className="field-label">Payment Method</span>
              <ChipSelector options={PAYMENT_METHODS} value={paymentMethod} onChange={setPaymentMethod} />
            </div>
          </div>

          <span className="field-label">Description / Notes</span>
          <textarea
            className="textarea-input"
            placeholder="What was this for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <span className="field-label">Receipt</span>
          <ReceiptPicker
            file={receiptFile || null}
            existingUrl={receiptFile === null ? null : existingReceiptUrl}
            onChange={setReceiptFile}
          />

          {formError && <div className="banner-error" style={{ marginTop: 16 }}>{formError}</div>}
          {savedMessage && <div className="banner-success" style={{ marginTop: 16 }}>{savedMessage}</div>}

          <button type="submit" className="button button-primary" style={{ marginTop: 24 }} disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Update Expense' : 'Save Expense'}
          </button>
        </form>
      </div>
    </>
  );
}
