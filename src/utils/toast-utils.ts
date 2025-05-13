
import { toast as baseToast } from "@/hooks/use-toast";
import { ToastProps } from "@/components/ui/toast";

// Extended toast with variant methods
export const toast = {
  // Base toast function
  ...baseToast,
  
  // Variant helpers
  error: (message: string) => {
    return baseToast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  },
  
  info: (message: string) => {
    return baseToast({
      title: "Info",
      description: message,
    });
  },
  
  success: (message: string) => {
    return baseToast({
      title: "Success",
      description: message,
    });
  },
  
  warning: (message: string) => {
    return baseToast({
      title: "Warning",
      description: message,
      variant: "destructive",
    });
  }
};
