
import { toast as sonnerToast, Toast, useToast as useSonnerToast } from "sonner";
import { ReactNode } from "react";

type ToastProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  variant?: "default" | "destructive";
};

const toast = {
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
  return { toast };
}

export { useToast, toast };
