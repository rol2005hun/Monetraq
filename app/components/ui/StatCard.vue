<template>
  <article class="card" :class="[`card--${tone}`]">
    <header class="card__header">
      <span class="card__label">{{ label }}</span>
      <slot name="icon" />
    </header>
    <div class="card__value">
      <slot />
    </div>
    <footer v-if="$slots.meta" class="card__meta">
      <slot name="meta" />
    </footer>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  tone: {
    type: String,
    default: 'neutral'
  }
});

const tone = computed(() => props.tone);
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
