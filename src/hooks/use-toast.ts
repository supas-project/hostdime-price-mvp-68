
import { toast as sonnerToast, ToastT } from "sonner";
import { ReactNode } from "react";

type ToastProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "destructive";
};

// Creating a wrapper around sonner toast functions
const toast = {
  // Direct toast function for basic usage
  default: ({ title, description, action, variant }: ToastProps) => {
    return sonnerToast(title as string, {
      description,
      action,
      className: variant === "destructive" ? "group border-destructive" : "group",
    });
  },
  success: ({ title, description, action }: ToastProps) => {
    return sonnerToast.success(title as string, {
      description,
      action,
      className: "group border-green-500",
    });
  },
  error: ({ title, description, action }: ToastProps) => {
    return sonnerToast.error(title as string, {
      description,
      action,
      className: "group border-destructive",
    });
  },
  warning: ({ title, description, action }: ToastProps) => {
    return sonnerToast.warning(title as string, {
      description,
      action,
      className: "group border-yellow-500",
    });
  },
  info: ({ title, description, action }: ToastProps) => {
    return sonnerToast.info(title as string, {
      description,
      action,
      className: "group border-blue-500",
    });
  },
};

function useToast() {
  // We don't use sonner's useToast since we're implementing our own
  return { 
    toast,
    toasts: [], // Empty array for compatibility with toaster.tsx
    dismiss: sonnerToast.dismiss,
  };
}

export { useToast, toast, type ToastProps };
