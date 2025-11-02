<template>
  <transition name="pwa-banner">
    <aside
      v-if="shouldShow"
      class="pwa-banner"
      role="dialog"
      aria-live="polite"
      aria-label="Install Monetraq"
    >
      <div class="pwa-banner__body">
        <div class="pwa-banner__copy">
          <h2 class="pwa-banner__title">Install Monetraq</h2>
          <p class="pwa-banner__description">
            Pin the app to your home screen for an even smoother offline experience.
          </p>
        </div>
        <div class="pwa-banner__actions">
          <button
            type="button"
            class="pwa-banner__install"
            :disabled="isInstalling"
            @click="install"
          >
            <span v-if="isInstalling">Installing...</span>
            <span v-else>Install app</span>
          </button>
          <button type="button" class="pwa-banner__dismiss" @click="dismiss">
            Not now
          </button>
        </div>
      </div>
    </aside>
  </transition>
</template>

<script setup lang="ts">
import { usePwaInstall } from '~/composables/usePwaInstall'

const { shouldShow, install, dismiss, isInstalling } = usePwaInstall()
</script>

<style scoped lang="scss">
@use '../../assets/scss/tokens' as *;

.pwa-banner-enter-from,
.pwa-banner-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.pwa-banner-enter-active,
.pwa-banner-leave-active {
  transition: opacity 0.24s ease, transform 0.24s ease;
}

.pwa-banner {
  position: fixed;
  inset-inline: clamp(1rem, 5vw, 2rem);
  bottom: clamp(1rem, 5vw, 2rem);
  background: rgba(17, 19, 37, 0.92);
  backdrop-filter: blur(30px);
  border-radius: $radius-lg;
  border: 1px solid $color-border;
  box-shadow: 0 24px 50px rgba(10, 12, 21, 0.45);
  padding: clamp(1.25rem, 2vw, 1.75rem);
  z-index: 900;
  color: $color-text;
  max-width: 420px;
}

.pwa-banner__body {
  display: grid;
  gap: 1.25rem;
}

.pwa-banner__title {
  margin: 0 0 0.35rem;
  font-size: 1.15rem;
  letter-spacing: 0.01em;
}

.pwa-banner__description {
  margin: 0;
  color: $color-text-muted;
  font-size: 0.95rem;
  line-height: 1.45;
}

.pwa-banner__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.pwa-banner__install {
  background: linear-gradient(135deg, rgba(133, 71, 240, 0.95), rgba(54, 205, 153, 0.95));
  border: none;
  border-radius: $radius-md;
  padding: 0.65rem 1.25rem;
  font-weight: 600;
  font-size: 0.95rem;
  letter-spacing: 0.01em;
  color: $color-text;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.pwa-banner__install:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.pwa-banner__install:disabled {
  opacity: 0.6;
  cursor: wait;
}

.pwa-banner__dismiss {
  background: transparent;
  color: $color-text-muted;
  border: none;
  padding: 0.5rem 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
}

.pwa-banner__dismiss:hover {
  color: $color-text;
}

@media (max-width: 520px) {
  .pwa-banner {
    inset-inline: 1rem;
    bottom: 1rem;
    padding: 1rem;
  }

  .pwa-banner__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .pwa-banner__dismiss {
    text-align: center;
  }
}
</style>
