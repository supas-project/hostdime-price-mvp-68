
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HelpTooltipProps {
  title: string;
  description: string;
  icon?: boolean;
  iconOnly?: boolean;
}

export function HelpTooltip({ title, description, icon = true, iconOnly = false }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className="cursor-help inline-flex items-center">
          {icon && (
            <HelpCircle className="h-4 w-4 text-muted-foreground/50 hover:text-primary" />
          )}
          {!iconOnly && (
            <span className="sr-only">{title}</span>
          )}
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-[280px] p-3 z-[100] bg-popover shadow-lg" 
          sideOffset={5}
        >
          <p className="text-sm leading-relaxed">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
