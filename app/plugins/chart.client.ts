import { ArcElement, BarController, BarElement, CategoryScale, Chart, Filler, Legend, LinearScale, Tooltip } from 'chart.js';

let registered = false;

export default defineNuxtPlugin(() => {
  if (registered) {
    return;
  }

  Chart.register(
    ArcElement,
    BarController,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Filler
  );

  registered = true;
});
