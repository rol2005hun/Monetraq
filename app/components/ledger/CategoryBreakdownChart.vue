<template>
  <div class="chart" :class="{ 'chart--loading': loading }" :aria-busy="loading">
    <div v-if="loading" class="chart__status" aria-live="polite">
      <span class="chart__spinner" aria-hidden="true"></span>
      <span>Loading data…</span>
    </div>
    <Doughnut v-else :data="data" :options="options" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';

const props = defineProps({
  labels: {
    type: Array as () => string[],
    required: true
  },
  dataset: {
    type: Array as () => number[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const palette = [
  'rgba(133, 71, 240, 0.85)',
  'rgba(163, 115, 255, 0.85)',
  'rgba(53, 211, 153, 0.85)',
  'rgba(255, 171, 92, 0.85)',
  'rgba(255, 107, 123, 0.85)',
  'rgba(76, 164, 255, 0.85)',
  'rgba(125, 92, 255, 0.85)'
];

const data = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      data: props.dataset,
      backgroundColor: props.labels.map((_, index) => palette[index % palette.length]),
      borderColor: 'rgba(9, 10, 18, 0.9)',
      borderWidth: 2
    }
  ]
}));

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#f7f9ff'
      }
    }
  }
}));
</script>

<style scoped lang="scss">
@use '../../assets/scss/tokens' as *;

.chart {
  position: relative;
  min-height: 280px;
}

.chart--loading {
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: $radius-lg;
  background: rgba(16, 18, 33, 0.75);
}

.chart__status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: $color-text-muted;
  font-weight: 500;
}

.chart__spinner {
  width: 1.3rem;
  height: 1.3rem;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  animation: chart-spin 0.8s linear infinite;
}

@keyframes chart-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
