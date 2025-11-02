<template>
  <div class="dashboard">
    <section class="dashboard__intro">
      <div>
        <h1>Keep pace with every movement</h1>
        <p>Log income and expenses with minute-level precision, even offline. Monetraq keeps the rhythm so you stay in control.</p>
      </div>
      <div class="dashboard__range">
        <label>Focus</label>
        <div class="range__segmented">
          <button
            v-for="option in viewOptions"
            :key="option.value"
            type="button"
            :class="['range__button', { 'range__button--active': viewMode === option.value }]"
            :disabled="isHydrating"
            @click="viewMode = option.value"
          >
            {{ option.label }}
          </button>
        </div>
        <input
          v-if="viewMode === 'daily'"
          v-model="dailyPicker"
          class="range__input"
          type="date"
          :disabled="isHydrating"
        />
        <input
          v-else-if="viewMode === 'weekly'"
          v-model="weeklyPicker"
          class="range__input"
          type="week"
          :disabled="isHydrating"
        />
        <input
          v-else-if="viewMode === 'monthly'"
          v-model="monthlyPicker"
          class="range__input"
          type="month"
          :disabled="isHydrating"
        />
        <input
          v-else
          v-model="yearlyPicker"
          class="range__input"
          type="number"
          min="1970"
          max="2100"
          step="1"
          :disabled="isHydrating"
        />
      </div>
    </section>

    <section class="dashboard__grid">
      <TransactionForm :categories="availableCategories" @submit="handleInsert" />

      <div class="dashboard__summary">
        <StatCard label="Balance" tone="accent" :loading="isHydrating">
          {{ formatCurrency(rangeTotals.net, currencyCode, preferredLocale) }}
          <template #meta>
            {{ rangeTotals.net >= 0 ? 'You are in profit' : 'Currently in deficit' }}
          </template>
        </StatCard>
        <StatCard label="Income" tone="positive" :loading="isHydrating">
          {{ formatCurrency(rangeTotals.income, currencyCode, preferredLocale) }}
          <template #meta>
            {{ formatRangeLabel }}
          </template>
        </StatCard>
        <StatCard label="Expenses" tone="negative" :loading="isHydrating">
          {{ formatCurrency(rangeTotals.expenses, currencyCode, preferredLocale) }}
          <template #meta>
            {{ expenseShareLabel }} of income
          </template>
        </StatCard>
      </div>
    </section>

    <section class="dashboard__analytics">
      <article class="dashboard__panel">
        <header>
          <h2>Monthly trend</h2>
          <p>Compare income vs expenses across recent months.</p>
        </header>
        <MonthlyTrendChart
          :labels="trend.labels"
          :income="trend.income"
          :expenses="trend.expenses"
          :loading="isHydrating"
        />
      </article>

      <article class="dashboard__panel">
        <header>
          <h2>Category breakdown</h2>
          <p>Where funds flow within the selected range.</p>
        </header>
        <CategoryBreakdownChart :labels="categoryBreakdown.labels" :dataset="categoryBreakdown.values" :loading="isHydrating" />
      </article>
    </section>

    <section class="dashboard__ledger">
      <header class="dashboard__ledger-header">
        <div>
          <h2>Ledger</h2>
          <p>{{ ledgerSubtitle }}</p>
        </div>
        <button type="button" class="dashboard__clear" @click="confirmClearAll" v-if="hasTransactions">
          Clear all data
        </button>
      </header>
  <TransactionList :groups="groupedEntries" :loading="isHydrating" @remove="handleRemove" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import TransactionForm from '../components/ledger/TransactionForm.vue';
import TransactionList, { type GroupedEntries } from '../components/ledger/TransactionList.vue';
import MonthlyTrendChart from '../components/ledger/MonthlyTrendChart.vue';
import CategoryBreakdownChart from '../components/ledger/CategoryBreakdownChart.vue';
import StatCard from '../components/ui/StatCard.vue';
import { formatDay, formatMonth, formatTime, startOfDay, endOfDay, withinRange } from '../utils/datetime';
import { formatCurrency } from '../utils/number';
import type { LedgerEntry } from '../composables/useLedger';
import { useLedger } from '../composables/useLedger';
import { usePreferredLocale } from '../composables/useLocale';

function toWeekInputValue(date: Date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);
  const day = target.getDay() || 7;
  target.setDate(target.getDate() + 4 - day);
  const yearStart = new Date(target.getFullYear(), 0, 1);
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${target.getFullYear()}-W${String(week).padStart(2, '0')}`;
}

function parseWeekInput(value: string | undefined) {
  if (!value) {
    return null;
  }

  const match = value.match(/^(\d{4})-W(\d{1,2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const week = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(week) || week < 1 || week > 53) {
    return null;
  }

  const base = new Date(year, 0, 1 + (week - 1) * 7);
  const day = base.getDay() || 7;
  const start = new Date(base);
  start.setDate(base.getDate() + 1 - day);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
}

function formatWeekRangeLabel(start: Date, end: Date, locale?: string) {
  const dayFormatter = new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric' });
  const yearFormatter = new Intl.DateTimeFormat(locale, { year: 'numeric' });
  const startLabel = dayFormatter.format(start);
  const endLabel = dayFormatter.format(end);
  const startYear = yearFormatter.format(start);
  const endYear = yearFormatter.format(end);
  const yearLabel = startYear === endYear ? startYear : `${startYear} / ${endYear}`;
  return `Week of ${startLabel} – ${endLabel}, ${yearLabel}`;
}

function formatYearLabel(year: number, locale?: string) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric' }).format(new Date(year, 0, 1));
}

const viewOptions = [
  { label: 'Daily', value: 'daily' as const },
  { label: 'Weekly', value: 'weekly' as const },
  { label: 'Monthly', value: 'monthly' as const },
  { label: 'Yearly', value: 'yearly' as const }
];

type ViewMode = (typeof viewOptions)[number]['value'];

const viewMode = ref<ViewMode>('monthly');
const today = new Date();
const dailyPicker = ref<string>(today.toISOString().slice(0, 10));
const weeklyPicker = ref<string>(toWeekInputValue(today));
const monthlyPicker = ref<string>(today.toISOString().slice(0, 7));
const yearlyPicker = ref<string>(String(today.getFullYear()));

const { transactions, monthlySummaries, availableCategories, addTransaction, removeTransaction, clearAll, state: ledgerState } = useLedger();
const preferredLocale = usePreferredLocale();
const currencyCode = 'HUF';
const isHydrating = computed(() => ledgerState.hydrating);
const hasTransactions = computed(() => !isHydrating.value && transactions.value.length > 0);

const sortedTransactions = computed<LedgerEntry[]>(() =>
  [...transactions.value].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
);

const rangeFilter = computed(() => {
  const locale = preferredLocale.value;

  if (viewMode.value === 'daily') {
    const day = new Date(`${dailyPicker.value}T00:00`);
    return {
      label: formatDay(day, locale),
      start: startOfDay(day),
      end: endOfDay(day)
    };
  }

  if (viewMode.value === 'weekly') {
    const parsed = parseWeekInput(weeklyPicker.value) ?? parseWeekInput(toWeekInputValue(today));
    const start = parsed?.start ?? startOfDay(today);
    const end = parsed?.end ?? endOfDay(today);
    return {
      label: formatWeekRangeLabel(start, end, locale),
      start,
      end
    };
  }

  if (viewMode.value === 'monthly') {
    const month = new Date(`${monthlyPicker.value}-01T00:00`);
    const start = new Date(month.getFullYear(), month.getMonth(), 1);
    const end = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59, 999);
    return {
      label: formatMonth(month, locale),
      start,
      end
    };
  }

  const parsedYear = Number.parseInt(yearlyPicker.value, 10);
  const year = Number.isFinite(parsedYear) ? parsedYear : today.getFullYear();
  const start = new Date(year, 0, 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);

  return {
    label: formatYearLabel(year, locale),
    start,
    end
  };
});

const rangeTransactions = computed<LedgerEntry[]>(() =>
  sortedTransactions.value.filter((entry) => withinRange(entry.timestamp, rangeFilter.value.start, rangeFilter.value.end))
);

const rangeTotals = computed(() =>
  rangeTransactions.value.reduce(
    (acc, entry) => {
      if (entry.type === 'income') {
        acc.income += entry.amount;
      } else {
        acc.expenses += entry.amount;
      }
      acc.net = acc.income - acc.expenses;
      return acc;
    },
    { income: 0, expenses: 0, net: 0 }
  )
);

const formatRangeLabel = computed(() => `In ${rangeFilter.value.label}`);

const expenseShareLabel = computed(() => {
  if (!rangeTotals.value.income) {
    return '—';
  }
  const ratio = (rangeTotals.value.expenses / rangeTotals.value.income) * 100;
  return `${Math.round(ratio)}%`;
});

const trend = computed(() => {
  const sorted = [...monthlySummaries.value].slice(-6);
  return {
    labels: sorted.map((item) => {
      const [year, month] = item.monthKey.split('-');
      return formatMonth(new Date(Number(year), Number(month) - 1, 1), preferredLocale.value);
    }),
    income: sorted.map((item) => item.income),
    expenses: sorted.map((item) => item.expenses)
  };
});

const categoryBreakdown = computed(() => {
  const bucket = new Map<string, number>();

  for (const entry of rangeTransactions.value) {
    if (entry.type !== 'expense') {
      continue;
    }
    const amount = bucket.get(entry.category) ?? 0;
    bucket.set(entry.category, amount + entry.amount);
  }

  const records = Array.from(bucket.entries()).sort((a, b) => b[1] - a[1]);

  return {
    labels: records.map(([category]) => category),
    values: records.map(([, value]) => Number(value.toFixed(2)))
  };
});

const groupedEntries = computed<GroupedEntries[]>(() => {
  const map = new Map<string, LedgerEntry[]>();

  for (const entry of rangeTransactions.value) {
    const key = entry.timestamp.slice(0, 10);
    const bucket = map.get(key) ?? [];
    bucket.push(entry);
    map.set(key, bucket);
  }

  return Array.from(map.entries())
    .map(([dayKey, entries]) => {
      const income = entries
        .filter((item) => item.type === 'income')
        .reduce((sum, item) => sum + item.amount, 0);

      const expenses = entries
        .filter((item) => item.type === 'expense')
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        dayKey,
        title: formatDay(`${dayKey}T00:00`, preferredLocale.value),
        subtitle: `${entries.length} movement${entries.length === 1 ? '' : 's'}`,
        incomeFormatted: formatCurrency(income, currencyCode, preferredLocale.value),
        expenseFormatted: formatCurrency(expenses, currencyCode, preferredLocale.value),
        entries: entries
          .slice()
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .map((item) => ({
            ...item,
            amountFormatted: `${item.type === 'income' ? '+' : '-'}${formatCurrency(item.amount, currencyCode, preferredLocale.value)}`,
            timeFormatted: formatTime(item.timestamp, preferredLocale.value)
          }))
      } satisfies GroupedEntries;
    })
    .sort((a, b) => (a.dayKey < b.dayKey ? 1 : -1));
});

const ledgerSubtitle = computed(() => {
  if (isHydrating.value) {
    return 'Loading your ledger...';
  }

  if (!rangeTransactions.value.length) {
    return 'No activity in this range yet.';
  }

  return `${rangeTransactions.value.length} entries between ${formatRangeLabel.value.toLowerCase()}`;
});

function handleInsert(payload: { type: LedgerEntry['type']; amount: number; category: string; note: string; timestamp: string }) {
  addTransaction({ ...payload });
}

function handleRemove(id: string) {
  removeTransaction(id);
}

function confirmClearAll() {
  const approved = window.confirm('Clear all stored entries? This action cannot be undone.');
  if (approved) {
    clearAll();
  }
}
</script>

<style scoped lang="scss">
@use '../assets/scss/tokens' as *;

.dashboard {
  display: grid;
  gap: 2.5rem;
}

.dashboard__intro {
  display: flex;
  justify-content: space-between;
  gap: clamp(1.5rem, 3vw, 3rem);
  align-items: flex-start;
}

.dashboard__intro h1 {
  margin: 0 0 1rem;
  font-size: clamp(2rem, 4vw, 2.8rem);
}

.dashboard__intro p {
  margin: 0;
  color: $color-text-muted;
  line-height: 1.6;
}

.dashboard__range {
  display: grid;
  gap: 0.6rem;
  min-width: 220px;
}

.dashboard__range label {
  font-size: 0.9rem;
  color: $color-text-muted;
}

.range__segmented {
  display: inline-flex;
  border-radius: $radius-sm;
  background: rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.range__button {
  padding: 0.6rem 1rem;
  border: none;
  background: transparent;
  color: $color-text-muted;
  cursor: pointer;
  font-weight: 500;
}

.range__button--active {
  background: rgba(133, 71, 240, 0.65);
  color: $color-text;
}

.range__button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.range__input {
  padding: 0.75rem 1rem;
  border-radius: $radius-sm;
  border: 1px solid rgba(255, 255, 255, 0.16);
  background: rgba(16, 18, 33, 0.8);
  color: $color-text;
  font-family: inherit;
}

.range__input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.range__input::-webkit-inner-spin-button,
.range__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.range__input[type='number'] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.range__input[type='date']::-webkit-calendar-picker-indicator,
.range__input[type='week']::-webkit-calendar-picker-indicator,
.range__input[type='month']::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.7;
  cursor: pointer;
}

.range__input[type='date']:hover::-webkit-calendar-picker-indicator,
.range__input[type='week']:hover::-webkit-calendar-picker-indicator,
.range__input[type='month']:hover::-webkit-calendar-picker-indicator,
.range__input[type='date']:focus::-webkit-calendar-picker-indicator,
.range__input[type='week']:focus::-webkit-calendar-picker-indicator,
.range__input[type='month']:focus::-webkit-calendar-picker-indicator {
  opacity: 1;
}

.dashboard__grid {
  display: grid;
  gap: 2rem;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  align-items: start;
}

.dashboard__summary {
  display: grid;
  gap: 1rem;
}

.dashboard__analytics {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: minmax(0, 1fr);
}

.dashboard__panel {
  display: grid;
  gap: 1rem;
  padding: 1.6rem;
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  background: rgba(16, 18, 33, 0.75);
}

.dashboard__panel header h2 {
  margin: 0 0 0.4rem;
}

.dashboard__panel header p {
  margin: 0;
  color: $color-text-muted;
}

.dashboard__ledger {
  display: grid;
  gap: 1.2rem;
}

.dashboard__ledger-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard__ledger-header h2 {
  margin: 0;
}

.dashboard__ledger-header p {
  margin: 0.3rem 0 0;
  color: $color-text-muted;
}

.dashboard__clear {
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: $color-text;
  border-radius: $radius-sm;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
}

.dashboard__clear:hover {
  background: rgba(255, 107, 123, 0.16);
}

@media (max-width: 1024px) {
  .dashboard__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 820px) {
  .dashboard__intro {
    flex-direction: column;
  }

  .dashboard__range {
    width: 100%;
  }
}

@media (min-width: 861px) {
  .dashboard__analytics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
