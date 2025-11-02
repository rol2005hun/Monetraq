<template>
  <main class="error">
    <section class="error__card">
      <h1>Something went off beat</h1>
      <p>
        {{ error?.message || 'An unexpected issue occurred. Try refreshing or return to the dashboard.' }}
      </p>
      <NuxtLink to="/" class="error__action">Back to Monetraq</NuxtLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ error?: { statusCode?: number; message?: string } }>();

const error = computed(() => props.error);

if (import.meta.client && error.value?.statusCode === 404) {
  console.warn('Monetraq route not found', error.value);
}
</script>

<style scoped lang="scss">
@use './assets/scss/tokens' as *;

.error {
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(130deg, rgba(133, 71, 240, 0.15), transparent 65%);
}

.error__card {
  background: rgba(17, 19, 37, 0.75);
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  padding: clamp(2.5rem, 6vw, 4rem);
  text-align: center;
  box-shadow: $shadow-soft;
  max-width: 480px;
}

h1 {
  margin: 0 0 1rem;
  font-size: clamp(1.5rem, 3vw, 2.3rem);
}

p {
  margin: 0 0 2rem;
  color: $color-text-muted;
  line-height: 1.6;
}

.error__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.8rem;
  border-radius: $radius-sm;
  background: linear-gradient(135deg, $color-accent, $color-accent-soft);
  color: $color-text;
  font-weight: 600;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.error__action:hover {
  transform: translateY(-1px);
  box-shadow: $shadow-ring;
}
</style>
