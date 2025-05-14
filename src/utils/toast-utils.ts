
import { toast as baseToast } from "@/hooks/use-toast";

// Configure default toast durations
const TOAST_DURATIONS = {
  default: 4000, // 4 seconds for regular notifications
  success: 3000, // 3 seconds for success messages
  error: 8000,   // 8 seconds for errors (more important)
  warning: 5000, // 5 seconds for warnings
  info: 4000     // 4 seconds for info messages
};

// Maximum number of simultaneous toasts
const MAX_TOASTS = 3;

// Extended toast with variant methods and improved configuration
export const toast = {
  // Base toast function with improved defaults
  ...baseToast,
  
  // Re-export the variant helpers with better defaults
  error: (message: string, options?: any) => {
    return baseToast.error(message, {
      duration: TOAST_DURATIONS.error,
      position: "top-right",
      important: true, // Mark error toasts as important
      dismissible: true, // Allow manual dismissal
      ...options
    });
  },
  
  info: (message: string, options?: any) => {
    return baseToast.info(message, {
      duration: TOAST_DURATIONS.info,
      position: "top-right",
      important: false,
      dismissible: true,
      ...options
    });
  },
  
  success: (message: string, options?: any) => {
    return baseToast.success(message, {
      duration: TOAST_DURATIONS.success,
      position: "top-right",
      important: false,
      dismissible: true,
      ...options
    });
  },
  
  warning: (message: string, options?: any) => {
    return baseToast.warning(message, {
      duration: TOAST_DURATIONS.warning,
      position: "top-right",
      important: true, // Mark warnings as somewhat important
      dismissible: true,
      ...options
    });
  }
};
