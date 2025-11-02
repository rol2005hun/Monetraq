# Monetraq

Monetraq is a minimalist personal finance dashboard built with Nuxt 4. The app focuses on quick data entry, rich visual feedback, and full offline support so you can keep tabs on income and expenses from anywhere.

## Highlights

- **Offline-first PWA** – installable experience with local persistence, background sync safeguards, and a custom install banner.
- **Ledger automation** – recurring summaries, range filtering (day/week/month/year), and instant recalculations of balance, income, and expenses.
- **Interactive analytics** – income vs. expense trend chart and expense category breakdown powered by Chart.js and vue-chartjs.
- **Mobile-friendly UX** – responsive layout, accessible forms, and optimized tap targets for small screens.
- **Localized currency & time** – automatic locale detection and formatting with amounts rendered in HUF by default.

## Tech Stack

- [Nuxt 4](https://nuxt.com/)
- [Vue 3](https://vuejs.org/) + `<script setup>` + TypeScript
- [Chart.js](https://www.chartjs.org/) with [vue-chartjs](https://vue-chartjs.org/)
- [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/frameworks/nuxt/) for the Service Worker and manifest integration
- SCSS design tokens for consistent theming

## Getting Started

### Prerequisites

- Node.js 20.10 or newer (aligns with Nuxt 4 requirements)
- npm 10 (bundled with recent Node releases)

### Installation

```bash
npm install
```

### Development

Start the dev server and visit `http://localhost:3000`:

```bash
npm run dev
```

Helpful tips:

- The app hydrates ledger data from `localStorage`. When you run the dev server for the first time you will see a brief loading state while entries hydrate.
- A custom install banner appears once the browser fires the `beforeinstallprompt` event. Dismissals are remembered for seven days.

### Production Build

Create an optimized build:

```bash
npm run build
```

Preview the generated build locally:

```bash
npm run preview
```

Generate static assets with pre-rendered routes (optional):

```bash
npm run generate
```

## Project Structure

```
app/
	components/
		ledger/        # Charts, transaction form, and list views
		ui/            # Shared UI widgets (stat cards, install banner, etc.)
	composables/     # Ledger state management, connectivity, locale, PWA hooks
	layouts/         # Default shell with status indicators and install banner
	pages/           # Dashboard page
	utils/           # Formatting helpers for dates and numbers
public/
	logo.png         # 512x512 PWA icon
	logo192.png      # 192x192 PWA icon
	icon.svg         # Maskable icon used across the app
```

## Data & Persistence

Transactions are stored entirely in the browser using `localStorage` under the key `monetraq-ledger-v1`. No data ever leaves the device. Clearing the ledger from the UI wipes those stored entries. Timing utilities ensure summaries and charts stay in sync with the chosen date range.

## PWA Notes

- The manifest and Service Worker are handled by `@vite-pwa/nuxt`.
- Install prompts are controlled through the custom `usePwaInstall` composable.
- Additional icons or screenshots can be added in `nuxt.config.ts` under the `pwa.manifest.icons` array.

## Contributing

Feel free to fork the project and open pull requests. Focus areas that would benefit from contributions include:

1. Budget planning features (targets, recurring bills, alerts)
2. Multi-currency support with live exchange rates
3. Automated tests (unit and component-level)

---

Monetraq keeps your financial rhythm steady, even when you are offline.