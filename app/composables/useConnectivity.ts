import { onBeforeUnmount, onMounted } from 'vue';

export function useConnectivity() {
  const isOnline = useState<boolean>('monetraq-online-status', () => true);

  if (import.meta.client) {
    onMounted(() => {
      const updateStatus = () => {
        isOnline.value = navigator.onLine;
      }

      updateStatus();
      window.addEventListener('online', updateStatus);
      window.addEventListener('offline', updateStatus);

      onBeforeUnmount(() => {
        window.removeEventListener('online', updateStatus);
        window.removeEventListener('offline', updateStatus);
      });
    });
  }

  return { isOnline };
}