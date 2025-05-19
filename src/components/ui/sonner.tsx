
import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      expand={false}
      closeButton={false}
      richColors
      visibleToasts={1} // Limit to 1 visible toast at once (to prevent stacking)
      offset={16} // Margin from the top
      duration={2500} // Auto-dismiss after 2.5 seconds
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-emerald-600/90 group-[.toaster]:text-white group-[.toaster]:border-none group-[.toaster]:shadow-lg group-[.toaster]:z-[1000] group-[.toaster]:animate-in group-[.toaster]:fade-in-0 group-[.toaster]:zoom-in-95 group-[.toaster]:slide-in-from-top-2 group-[.toaster]:py-2 group-[.toaster]:px-4 group-[.toaster]:rounded-md group-[.toaster]:font-medium",
          description: "group-[.toast]:text-white/90 group-[.toast]:text-sm",
          actionButton:
            "group-[.toast]:bg-white group-[.toast]:text-emerald-600",
          cancelButton:
            "group-[.toast]:bg-white/20 group-[.toast]:text-white",
          // Custom styles for different variants
          success: "group-[.toaster]:bg-emerald-600/90 group-[.toaster]:text-white",
          error: "group-[.toaster]:bg-red-500/90 group-[.toaster]:text-white",
          warning: "group-[.toaster]:bg-amber-500/90 group-[.toaster]:text-white",
          info: "group-[.toaster]:bg-blue-500/90 group-[.toaster]:text-white",
        },
        style: {
          zIndex: 1000,
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
