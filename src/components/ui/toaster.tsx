
import { useToast } from "@/hooks/use-toast"
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      expand={false}
      closeButton={true}
      richColors
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          title: "group-[.toast]:text-foreground group-[.toast]:font-medium group-[.toast]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs group-[.toast]:mt-1",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:shadow-sm",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toast]:border-l-4 group-[.toast]:border-l-green-500",
          error: "group-[.toast]:border-l-4 group-[.toast]:border-l-destructive",
          warning: "group-[.toast]:border-l-4 group-[.toast]:border-l-amber-500",
          info: "group-[.toast]:border-l-4 group-[.toast]:border-l-blue-500",
        },
        duration: 4000,
      }}
    />
  )
}
