
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
}

export function HelpTooltip({ title, description, icon = true }: HelpTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger className="cursor-help inline-flex items-center">
          {icon && <HelpCircle className="h-4 w-4 ml-1 text-muted-foreground/50 hover:text-primary" />}
          <span className="ml-1 border-dashed border-b border-muted-foreground/50 hover:border-primary">
            {title}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-[280px] p-3">
          <p className="text-sm leading-relaxed">{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
