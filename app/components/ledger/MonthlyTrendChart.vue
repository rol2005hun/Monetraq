<template>
  <div class="chart">
    <Bar :options="options" :data="data" />
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
        callback: (value: string | number) => `$${value}`
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.06)'
      }
    }
  }
}));
</script>

<style scoped lang="scss">
.chart {
  min-height: 320px;
}
</style>
