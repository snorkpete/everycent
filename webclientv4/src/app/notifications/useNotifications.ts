import { useToast } from 'primevue/usetoast';

export function useNotifications() {
  const toast = useToast();

  return {
    success(message: string) {
      toast.add({ severity: 'success', summary: 'Success', detail: message, life: 3000 });
    },
    error(message: string) {
      toast.add({ severity: 'error', summary: 'Error', detail: message, life: 5000 });
    },
    info(message: string) {
      toast.add({ severity: 'info', summary: 'Info', detail: message, life: 3000 });
    },
  };
}
