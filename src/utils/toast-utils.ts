
import { toast as sonnerToast } from "sonner";

interface ToastOptions {
  description?: string;
  icon?: React.ReactNode;
  duration?: number;
}

export const toast = {
  success: (title: string, options?: ToastOptions) => {
    sonnerToast.success(title, options);
  },
  error: (title: string, options?: ToastOptions) => {
    sonnerToast.error(title, options);
  },
  info: (title: string, options?: ToastOptions) => {
    sonnerToast.info(title, options);
  },
  warning: (title: string, options?: ToastOptions) => {
    sonnerToast.warning(title, options);
  }
};
