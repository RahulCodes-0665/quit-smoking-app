export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameLocalDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b);
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

export function startOfWeekMonday(date: Date): Date {
  const start = startOfLocalDay(date);
  const weekday = start.getDay();
  const offset = weekday === 0 ? 6 : weekday - 1;
  return addDays(start, -offset);
}

export function daysBetween(from: Date, to: Date): number {
  const start = startOfLocalDay(from).getTime();
  const end = startOfLocalDay(to).getTime();
  return Math.round((end - start) / (24 * 60 * 60 * 1000));
}

export function formatWeekdayShort(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatScheduledDay(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function clampToTodayOrEarlier(date: Date): Date {
  const selected = startOfLocalDay(date);
  const today = startOfLocalDay(new Date());
  return selected.getTime() > today.getTime() ? today : selected;
}

export function lastNLocalDays(days: number, from = new Date()): Date[] {
  const end = startOfLocalDay(from);
  return Array.from({ length: days }, (_, index) => {
    const offset = days - 1 - index;
    return new Date(end.getFullYear(), end.getMonth(), end.getDate() - offset);
  });
}

export function formatChartDayLabel(date: Date): string {
  return String(date.getDate());
}
