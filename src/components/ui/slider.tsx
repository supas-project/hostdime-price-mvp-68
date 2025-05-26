
import * as React from "react"
import * as SliderPrimitive from "@radix-ui/react-slider"

import { cn } from "@/lib/utils"

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center py-2",
      className
    )}
    {...props}
  >
    <SliderPrimitive.Track className={cn(
      "relative h-3 w-full grow overflow-hidden rounded-full bg-secondary shadow-inner",
      "transition-all duration-200"
    )}>
      <SliderPrimitive.Range className={cn(
        "absolute h-full bg-gradient-to-r from-[#f58220] to-[#ff8533] rounded-full",
        "shadow-md shadow-[#f58220]/30 transition-all duration-300"
      )} />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className={cn(
      "block h-6 w-6 rounded-full border-3 border-[#f58220] bg-white ring-offset-background",
      "transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f58220] focus-visible:ring-offset-2",
      "disabled:pointer-events-none disabled:opacity-50",
      "hover:scale-110 hover:shadow-lg hover:shadow-[#f58220]/40 active:scale-105",
      "cursor-grab active:cursor-grabbing"
    )} />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
