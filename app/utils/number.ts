const formatterCache = new Map<string, Intl.NumberFormat>();

function resolveLocale(locale?: string) {
  if (locale && typeof locale === 'string') {
    return locale;
  }
  return 'en-US';
}

function getFormatter(currency: string, locale?: string) {
  const resolvedLocale = resolveLocale(locale);
  const key = `${resolvedLocale}-${currency}`;

  if (!formatterCache.has(key)) {
    formatterCache.set(
      key,
      new Intl.NumberFormat(resolvedLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
  }

  return formatterCache.get(key)!;
}

export function formatCurrency(value: number, currency = 'HUF', locale?: string) {
  return getFormatter(currency, locale).format(value);
}

export function formatSignedCurrency(value: number, currency = 'HUF', locale?: string) {
  const formatter = getFormatter(currency, locale);
  const formatted = formatter.format(Math.abs(value));
  return value >= 0 ? `+${formatted}` : `-${formatted}`;
}
