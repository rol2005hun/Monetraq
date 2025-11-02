// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/scss/main.scss'],
  modules: ['@vite-pwa/nuxt'],
  app: {
    head: {
      title: 'Monetraq · Your money. Your rhythm.',
      meta: [
        { name: 'description', content: 'Monetraq is your minimalist offline finance tracker. Your money. Your rhythm.' },
        { name: 'theme-color', content: '#0f111a' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/icon.svg' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/logo192.png' },
        { rel: 'apple-touch-icon', href: '/icon.png' }
      ]
    }
  },

  pwa: {
    registerType: 'autoUpdate',
    registerWebManifestInRouteRules: true,
    strategies: process.env.NODE_ENV === 'development' ? 'injectManifest' : 'generateSW',
    manifest: {
      name: 'Monetraq',
      short_name: 'Monetraq',
      description: 'Track income and expenses offline with Monetraq. Your money. Your rhythm.',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#0f111a',
      theme_color: '#8547f0',
      lang: 'en',
      icons: [
        {
          src: '/icon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        },
        {
          src: '/logo192.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/icon.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
      cleanupOutdatedCaches: true
    },
    client: {
      installPrompt: true
    },
    devOptions: {
      enabled: false,
      suppressWarnings: true
    }
  }
});