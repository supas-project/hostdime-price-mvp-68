
import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type ToastOptions = {
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
  duration?: number;
};

export const toast = {
  success: (title: string, options?: ToastOptions) => {
    sonnerToast.success(title, {
      ...options,
      icon: options?.icon || <CheckCircle2 className="h-5 w-5" />
    });
  },
  error: (title: string, options?: ToastOptions) => {
    sonnerToast.error(title, {
      ...options,
      icon: options?.icon || <AlertCircle className="h-5 w-5" />
    });
  },
  info: (title: string, options?: ToastOptions) => {
    sonnerToast.info(title, {
      ...options,
      icon: options?.icon || <Info className="h-5 w-5" />
    });
  }
};
