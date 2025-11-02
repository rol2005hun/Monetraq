<template>
  <div class="layout">
    <header class="layout__header">
      <div class="layout__identity">
        <div class="layout__mark">
          <span class="layout__pulse" aria-hidden="true"></span>
        </div>
        <div>
          <h1 class="layout__title">Monetraq</h1>
          <p class="layout__motto">Your money. Your rhythm.</p>
        </div>
      </div>
      <div class="layout__status" role="status">
        <span :class="['status-indicator', isOnline ? 'status-indicator--online' : 'status-indicator--offline']"></span>
        <span class="layout__status-label">{{ isOnline ? 'Offline ready' : 'You are offline' }}</span>
      </div>
    </header>

    <main class="layout__content">
      <slot />
    </main>

    <footer class="layout__footer">
      <small>&copy; {{ currentYear }} Monetraq. Built for focus and flow.</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useConnectivity } from '~/composables/useConnectivity'

const { isOnline } = useConnectivity()
const currentYear = new Date().getFullYear()
</script>

<style scoped lang="scss">
@use '../assets/scss/tokens' as *;

.layout {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding: 2.5rem clamp(1.5rem, 3vw, 3rem);
  gap: 2rem;
}

.layout__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(17, 19, 37, 0.6);
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  padding: clamp(1.5rem, 2vw, 2rem);
  backdrop-filter: blur(24px);
  box-shadow: $shadow-soft;
}

.layout__identity {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.layout__mark {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(140deg, rgba(133, 71, 240, 0.9), rgba(54, 205, 153, 0.9));
  display: grid;
  place-content: center;
  position: relative;
  overflow: hidden;
}

.layout__pulse {
  display: inline-block;
  width: 20px;
  height: 20px;
  background: $color-text;
  border-radius: 6px;
  transform: rotate(45deg);
  animation: pulse 2.8s infinite ease-in-out;
  box-shadow: 0 0 0 1px rgba(15, 17, 26, 0.25) inset;
}

@keyframes pulse {
  0% {
    transform: scale(0.9) rotate(45deg);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.1) rotate(45deg);
    opacity: 1;
  }
  100% {
    transform: scale(0.9) rotate(45deg);
    opacity: 0.7;
  }
}

.layout__title {
  margin: 0;
  font-size: clamp(1.6rem, 2.8vw, 2rem);
  letter-spacing: 0.02em;
}

.layout__motto {
  margin: 0.2rem 0 0;
  color: $color-text-muted;
  font-size: 0.95rem;
}

.layout__status {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 1rem;
  border-radius: $radius-sm;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid $color-border;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-indicator {
  display: inline-flex;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 16px currentColor;
}

.status-indicator--online {
  color: $color-positive;
}

.status-indicator--offline {
  color: $color-warning;
}

.layout__status-label {
  letter-spacing: 0.01em;
}

.layout__content {
  width: min(1180px, 100%);
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.layout__footer {
  text-align: center;
  color: $color-text-muted;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .layout {
    padding: 1.5rem;
    gap: 1.5rem;
  }

  .layout__header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1.2rem;
  }

  .layout__status {
    width: 100%;
    justify-content: center;
  }
}
</style>
