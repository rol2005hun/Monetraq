<template>
  <div class="chart" :class="{ 'chart--loading': loading }" :aria-busy="loading">
    <div v-if="loading" class="chart__status" aria-live="polite">
      <span class="chart__spinner" aria-hidden="true"></span>
      <span>Loading data…</span>
    </div>
    <Bar v-else :options="options" :data="data" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';

const props = defineProps({
  labels: {
    type: Array as () => string[],
    required: true
  },
  income: {
    type: Array as () => number[],
    required: true
  },
  expenses: {
    type: Array as () => number[],
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const data = computed(() => ({
  labels: props.labels,
  datasets: [
    {
      label: 'Income',
      data: props.income,
      backgroundColor: 'rgba(53, 211, 153, 0.65)',
      borderRadius: 10,
      maxBarThickness: 26
    },
    {
      label: 'Expenses',
      data: props.expenses,
      backgroundColor: 'rgba(255, 107, 123, 0.65)',
      borderRadius: 10,
      maxBarThickness: 26
    }
  ]
}));

const options = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#f7f9ff',
        font: { size: 12 }
      }
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false
    }
  },
  scales: {
    x: {
      ticks: {
        color: 'rgba(247, 249, 255, 0.65)'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.06)'
      }
    },
    y: {
      ticks: {
        color: 'rgba(247, 249, 255, 0.65)',
        callback: (value: string | number) => `HUF ${value}`
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.06)'
      }
    }
  }
}));
</script>

<style scoped lang="scss">
@use '../../assets/scss/tokens' as *;

.chart {
  position: relative;
  min-height: 320px;
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
