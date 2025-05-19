
import { toast as sonnerToast } from "sonner";
import { ReactNode } from "react";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import React from "react";

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
      // Create icon element properly for TypeScript
      icon: options?.icon || React.createElement(CheckCircle2, { className: "h-5 w-5" })
    });
  },
  error: (title: string, options?: ToastOptions) => {
    sonnerToast.error(title, {
      ...options,
      // Create icon element properly for TypeScript
      icon: options?.icon || React.createElement(AlertCircle, { className: "h-5 w-5" })
    });
  },
  info: (title: string, options?: ToastOptions) => {
    sonnerToast.info(title, {
      ...options,
      // Create icon element properly for TypeScript
      icon: options?.icon || React.createElement(Info, { className: "h-5 w-5" })
    });
  }
};
