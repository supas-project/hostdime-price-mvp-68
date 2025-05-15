
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
            <HelpCircle className="h-4 w-4 text-muted-foreground/50 hover:text-primary transition-colors" />
          )}
          {!iconOnly && (
            <span className="sr-only">{title}</span>
          )}
        </TooltipTrigger>
        <TooltipContent 
          className="max-w-[250px] p-3 z-[100]" 
          side="top"
          sideOffset={5}
          align="center"
        >
          <p className="text-sm leading-relaxed break-words">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
