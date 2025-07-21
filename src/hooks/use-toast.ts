// Re-export from sonner for compatibility
export { toast } from 'sonner';

// Mock useToast hook for compatibility
export function useToast() {
  return {
    toast: (options: any) => {
      console.log('Toast:', options);
    }
  };
}