<template>
  <section class="list">
    <div v-if="loading" class="list__status" aria-live="polite" aria-busy="true">
      <span class="list__spinner" aria-hidden="true"></span>
      <span>Loading your ledger...</span>
    </div>

    <template v-else>
      <div v-for="group in groups" :key="group.dayKey" class="list__group">
        <header class="list__group-header">
          <div>
            <h2>{{ group.title }}</h2>
            <p>{{ group.subtitle }}</p>
          </div>
          <div class="list__group-totals">
            <span class="badge badge--income">+{{ group.incomeFormatted }}</span>
            <span class="badge badge--expense">-{{ group.expenseFormatted }}</span>
          </div>
        </header>

        <ul class="list__items">
          <li v-for="entry in group.entries" :key="entry.id" class="list__item">
            <div class="list__icon" :class="[`list__icon--${entry.type}`]">
              <span>{{ entry.category[0]?.toUpperCase() }}</span>
            </div>
            <div class="list__meta">
              <strong>{{ entry.category }}</strong>
              <span>{{ entry.note || '—' }}</span>
            </div>
            <time class="list__time" :datetime="entry.timestamp">{{ entry.timeFormatted }}</time>
            <span class="list__amount" :class="[`list__amount--${entry.type}`]">
              {{ entry.amountFormatted }}
            </span>
            <button class="list__remove" type="button" @click="$emit('remove', entry.id)">
              <span class="sr-only">Remove</span>
              ×
            </button>
          </li>
        </ul>
      </div>

      <p v-if="!groups.length" class="list__empty">
        No entries yet. Log your first movement to start the rhythm.
      </p>
    </template>
  </section>
</template>

<script setup lang="ts">
import type { LedgerEntry } from '../../composables/useLedger';

interface EntryViewModel extends LedgerEntry {
  amountFormatted: string;
  timeFormatted: string;
}

export interface GroupedEntries {
  dayKey: string;
  title: string;
  subtitle: string;
  incomeFormatted: string;
  expenseFormatted: string;
  entries: EntryViewModel[];
}

defineProps<{ groups: GroupedEntries[]; loading?: boolean }>();

defineEmits<{ (event: 'remove', id: string): void }>();
</script>

<style scoped lang="scss">
@use '../../assets/scss/tokens' as *;

.list {
  display: grid;
  gap: 1.5rem;
}

.list__status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  border-radius: $radius-lg;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(17, 19, 33, 0.75);
  color: $color-text-muted;
  font-weight: 500;
}

.list__spinner {
  width: 1.2rem;
  height: 1.2rem;
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top-color: $color-accent;
  border-radius: 50%;
  animation: list-spin 0.8s linear infinite;
}

.list__group {
  background: rgba(17, 19, 33, 0.75);
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  overflow: hidden;
}

.list__group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(17, 19, 33, 0.9);
}

.list__group-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.list__group-header p {
  margin: 0.2rem 0 0;
  color: $color-text-muted;
  font-size: 0.85rem;
}

.list__group-totals {
  display: flex;
  gap: 0.6rem;
  font-size: 0.85rem;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  font-weight: 600;
}

.badge--income {
  background: rgba(53, 211, 153, 0.16);
  color: $color-positive;
}

.badge--expense {
  background: rgba(255, 107, 123, 0.16);
  color: $color-negative;
}

.list__items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.list__item {
  display: grid;
  grid-template-columns: auto 1fr auto auto auto;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.list__icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  font-weight: 700;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.08);
}

.list__icon--income {
  color: $color-positive;
}

.list__icon--expense {
  color: $color-negative;
}

.list__meta {
  display: grid;
  gap: 0.2rem;
}

.list__meta strong {
  font-weight: 600;
}

.list__meta span {
  color: $color-text-muted;
  font-size: 0.85rem;
}

.list__time {
  color: $color-text-muted;
  font-size: 0.9rem;
}

.list__amount {
  font-weight: 600;
  font-size: 1rem;
}

.list__amount--income {
  color: $color-positive;
}

.list__amount--expense {
  color: $color-negative;
}

.list__remove {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: $color-text;
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1.1rem;
}

.list__remove:hover {
  background: rgba(255, 255, 255, 0.14);
}

.list__empty {
  text-align: center;
  color: $color-text-muted;
  padding: 1.8rem;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  border-radius: $radius-md;
}

@keyframes list-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .list__item {
    grid-template-columns: auto 1fr;
    grid-template-areas:
      'icon meta'
      'time time'
      'amount amount'
      'remove remove';
  }

  .list__icon {
    grid-area: icon;
  }

  .list__meta {
    grid-area: meta;
  }

  .list__time {
    grid-area: time;
  }

  .list__amount {
    grid-area: amount;
  }

  .list__remove {
    grid-area: remove;
    justify-self: flex-start;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
