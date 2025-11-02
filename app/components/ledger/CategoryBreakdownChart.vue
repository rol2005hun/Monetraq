<template>
  <div class="chart">
    <Doughnut :data="data" :options="options" />
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
.chart {
  min-height: 280px;
}
</style>
