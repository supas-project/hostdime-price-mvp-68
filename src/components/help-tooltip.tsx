
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface HelpTooltipProps {
  title: string;
  description: string;
  icon?: boolean;
  iconOnly?: boolean;
  className?: string;
  iconClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
}

export function HelpTooltip({
  title,
  description,
  icon = true,
  iconOnly = false,
  className,
  iconClassName,
  side = "top",
  align = "center",
}: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger
          className={cn(
            "cursor-help inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full",
            className
          )}
          aria-label={title}
        >
          {icon && (
            <HelpCircle
              className={cn(
                "h-4 w-4 text-muted-foreground/50 hover:text-primary transition-colors",
                iconClassName
              )}
            />
          )}
          {!iconOnly && <span className="sr-only">{title}</span>}
        </TooltipTrigger>
        <TooltipContent
          className="max-w-[250px] p-3 z-[100] text-sm font-medium shadow-md"
          side={side}
          sideOffset={5}
          align={align}
        >
          <p className="text-sm leading-relaxed break-words">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
