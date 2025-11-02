const formatterCache = new Map<string, Intl.DateTimeFormat>();

function resolveLocale(locale?: string) {
  if (locale) {
    return locale;
  }

  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language;
  }

  return 'en-US';
}

function getFormatter(options: Intl.DateTimeFormatOptions, locale?: string) {
  const resolved = resolveLocale(locale);
  const key = JSON.stringify({ options, locale: resolved });
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.DateTimeFormat(resolved, options));
  }
  return formatterCache.get(key)!;
}

export function formatDay(date: Date | string, locale?: string) {
  const source = typeof date === 'string' ? new Date(date) : date;
  return getFormatter(
    { weekday: 'long', month: 'short', day: 'numeric' },
    locale
  ).format(source);
}

export function formatMonth(date: Date | string, locale?: string) {
  const source = typeof date === 'string' ? new Date(date) : date;
  return getFormatter(
    { month: 'long', year: 'numeric' },
    locale
  ).format(source);
}

export function formatTime(date: Date | string, locale?: string) {
  const source = typeof date === 'string' ? new Date(date) : date;
  return getFormatter(
    { hour: '2-digit', minute: '2-digit' },
    locale
  ).format(source);
}

export function toDatetimeLocalInput(date: Date) {
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

export function fromDatetimeLocalInput(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000).toISOString();
}

export function isSameDay(a: Date | string, b: Date | string) {
  const first = typeof a === 'string' ? new Date(a) : a;
  const second = typeof b === 'string' ? new Date(b) : b;
  return (
    first.getFullYear() === second.getFullYear() &&
    first.getMonth() === second.getMonth() &&
    first.getDate() === second.getDate()
  );
}

export function isSameMonth(a: Date | string, b: Date | string) {
  const first = typeof a === 'string' ? new Date(a) : a;
  const second = typeof b === 'string' ? new Date(b) : b;
  return first.getFullYear() === second.getFullYear() && first.getMonth() === second.getMonth();
}

export function addMonths(base: Date, delta: number) {
  const next = new Date(base);
  next.setMonth(next.getMonth() + delta);
  return next;
}

export function startOfDay(date: Date | string) {
  const source = typeof date === 'string' ? new Date(date) : date;
  return new Date(source.getFullYear(), source.getMonth(), source.getDate());
}

export function endOfDay(date: Date | string) {
  const source = typeof date === 'string' ? new Date(date) : date;
  return new Date(source.getFullYear(), source.getMonth(), source.getDate(), 23, 59, 59, 999);
}

export function withinRange(timestamp: string, start: Date, end: Date) {
  const value = new Date(timestamp).getTime();
  return value >= start.getTime() && value <= end.getTime();
}
