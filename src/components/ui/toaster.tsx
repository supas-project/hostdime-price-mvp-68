
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"

export function Toaster() {
  // Our custom hook doesn't need toasts from here
  // It's handled by the Sonner component
  return (
    <ToastProvider>
      <ToastViewport />
    </ToastProvider>
  )
}
