import { iconForCategory } from '../theme';
import { formatCurrency, formatDate } from '../utils/format';
import { useSettings } from '../context/SettingsContext';

export default function ExpenseListItem({ expense, onPress, onEdit, onDelete }) {
  const { currency } = useSettings();
  return (
    <div className="expense-item" role="button" tabIndex={0} onClick={onPress}>
      <div className="expense-icon">{iconForCategory(expense.category)}</div>
      <div className="expense-middle">
        <p className="expense-category">{expense.category}</p>
        <p className="expense-description">{expense.description || 'No description'}</p>
        <p className="expense-meta">
          {formatDate(expense.date)} · {expense.paymentMethod}
        </p>
      </div>
      <div className="expense-right">
        <div className="expense-amount">{formatCurrency(expense.amount, currency)}</div>
        {expense.receiptUrl ? (
          <img className="expense-thumb" src={expense.receiptUrl} alt="Receipt" />
        ) : null}
        {(onEdit || onDelete) && (
          <div className="expense-actions">
            {onEdit && (
              <button
                type="button"
                className="icon-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                aria-label="Edit"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                className="icon-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                aria-label="Delete"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
