
import { toast as baseToast } from "@/hooks/use-toast";

// Extended toast with variant methods
export const toast = {
  // Base toast function
  ...baseToast,
  
  // Variant helpers are already defined in the hook, but we'll redefine them here for clarity
  error: (message: string, options?: any) => {
    return baseToast.error(message, options);
  },
  
  info: (message: string, options?: any) => {
    return baseToast.info(message, options);
  },
  
  success: (message: string, options?: any) => {
    return baseToast.success(message, options);
  },
  
  warning: (message: string, options?: any) => {
    return baseToast.warning(message, options);
  }
};
