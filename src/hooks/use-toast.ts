
// This file now serves as a centralized export for toast functionality
import { toast as sonnerToast } from "sonner";
import { toast as shadcnToast, ToastActionElement, Toast } from "@/components/ui/toast";

// Export types from shadcn toast
export type { Toast, ToastActionElement };

// Export the hook from shadcn
export { useToast } from "@/components/ui/toast";

// Create a unified toast API
export const toast = {
  ...sonnerToast,
  // Add the shadcn toast configuration
  configure: (config: { showUIToasts: boolean }) => {
    console.log('Toast configuration updated:', config);
    // This function exists for backward compatibility
    // but doesn't need to do anything as we're using both toast systems
  }
};
