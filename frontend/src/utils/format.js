import { format, parseISO } from 'date-fns';

export function formatCurrency(amount, symbol = '₹') {
  const n = Number(amount) || 0;
  return `${symbol}${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern);
}

export function formatDateTime(date) {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
}

export function toApiDateString(date) {
  return format(date, 'yyyy-MM-dd');
}
