
import { toast as baseToast } from "@/hooks/use-toast";

// Extended toast with variant methods
export const toast = {
  // Base toast function
  ...baseToast,
  
  // Variant helpers are already defined in the hook, but we'll redefine them here to match the expected API
  error: (message: string) => {
    return baseToast.error(message);
  },
  
  info: (message: string) => {
    return baseToast.info(message);
  },
  
  success: (message: string) => {
    return baseToast.success(message);
  },
  
  warning: (message: string) => {
    return baseToast.warning(message);
  }
};
