<template>
  <article class="card" :class="[`card--${toneClass}`]" :aria-busy="isLoading">
    <header class="card__header">
      <span class="card__label">{{ label }}</span>
      <slot name="icon" />
    </header>
    <div class="card__value">
      <template v-if="isLoading">
        <span class="card__spinner" aria-hidden="true"></span>
        <span class="card__loading-text">Loading…</span>
      </template>
      <slot v-else />
    </div>
    <footer v-if="$slots.meta && !isLoading" class="card__meta">
      <slot name="meta" />
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';

type Tone = 'accent' | 'positive' | 'negative' | 'neutral';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  tone: {
    type: String as () => Tone,
    default: 'neutral'
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const { label, loading } = toRefs(props);
const toneClass = computed(() => props.tone);
const isLoading = computed(() => loading.value);
</script>

<style scoped lang="scss">
@use '../../assets/scss/tokens' as *;

.card {
  display: grid;
  gap: 0.75rem;
  padding: 1.4rem;
  border-radius: $radius-md;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(19, 21, 36, 0.75);
  box-shadow: $shadow-soft;
  transition: transform 0.25s ease, border-color 0.25s ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.14);
}

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  color: $color-text-muted;
  font-size: 0.9rem;
}

.card__value {
  font-size: clamp(1.6rem, 2.8vw, 2.1rem);
  font-weight: 600;
  letter-spacing: 0.01em;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.card__spinner {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: card-spin 0.8s linear infinite;
}

.card__loading-text {
  font-size: 1rem;
  color: $color-text-muted;
}

@keyframes card-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.card__meta {
  font-size: 0.85rem;
  color: $color-text-muted;
}

.card--positive {
  background: linear-gradient(160deg, rgba(53, 211, 153, 0.22), rgba(16, 18, 32, 0.88));
}

.card--negative {
  background: linear-gradient(160deg, rgba(255, 107, 123, 0.22), rgba(16, 18, 32, 0.88));
}

.card--accent {
  background: linear-gradient(160deg, rgba(133, 71, 240, 0.22), rgba(16, 18, 32, 0.88));
}
</style>
