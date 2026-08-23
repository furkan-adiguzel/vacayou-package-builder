export function formatMoney(value: number | null, currency = 'USD'): string {
  if (value === null) return '—';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | null): string {
  if (!value) return '—';

  return new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}

export function formatDateRange(start: string | null, end: string | null): string {
  if (!start || !end) return 'Dates not set';
  return `${formatDate(start)} – ${formatDate(end)}`;
}
