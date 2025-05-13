
import * as React from "react"
import { toast as sonnerToast, type ToastT, type ExternalToast } from "sonner";

// Define a standard interface for toast functions to ensure consistent usage
export interface ToastOptions {
  description?: React.ReactNode
  action?: React.ReactNode
  variant?: "default" | "destructive" | "success"
}

// Simple wrapper around sonner toast that conforms to our project's structure
function toast(message: string, options?: ToastOptions) {
  const { description, variant, ...rest } = options || {};
  
  // Convert our variant to sonner styling
  if (variant === "destructive") {
    return sonnerToast.error(message, { ...rest, description });
  } else if (variant === "success") {
    return sonnerToast.success(message, { ...rest, description });
  } else {
    return sonnerToast(message, { ...rest, description });
  }
}

// Add variants as direct methods for convenience
toast.error = (message: string, options?: Omit<ToastOptions, "variant">) => {
  return sonnerToast.error(message, options);
};

toast.success = (message: string, options?: Omit<ToastOptions, "variant">) => {
  return sonnerToast.success(message, options);
};

toast.info = (message: string, options?: Omit<ToastOptions, "variant">) => {
  return sonnerToast(message, options);
};

toast.warning = (message: string, options?: Omit<ToastOptions, "variant">) => {
  return sonnerToast.warning(message, options);
};

function useToast() {
  return {
    toast,
    // Exposing the raw toasts array isn't necessary with sonner, but keeping the API consistent
    toasts: [],
    dismiss: (toastId?: string) => {
      if (toastId) {
        sonnerToast.dismiss(toastId);
      } else {
        sonnerToast.dismiss();
      }
    }
  }
}

export { useToast, toast };
