export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function formatCurrency(amount: number, currency: 'AED' | 'USD' = 'AED'): string {
  return `${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function parseDate(dateString: string): Date {
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  return new Date(dateString);
}

export function daysUntil(targetDate: string, baseDateStr = '2026-10-28'): number {
  const target = parseDate(targetDate);
  const base = parseDate(baseDateStr);
  const diffTime = target.getTime() - base.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string, baseDateStr = '2026-10-28'): boolean {
  return daysUntil(dueDate, baseDateStr) < 0;
}

export function isToday(dateString: string, baseDateStr = '2026-10-28'): boolean {
  if (!dateString) return false;
  return dateString.slice(0, 10) === baseDateStr.slice(0, 10);
}
