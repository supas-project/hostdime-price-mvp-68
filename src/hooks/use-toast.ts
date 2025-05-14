
import { toast } from "sonner";

// Re-export the toast function
export { toast };

export function useToast() {
  return {
    toast,
  };
}
