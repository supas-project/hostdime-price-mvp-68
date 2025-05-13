
import { HelpTooltip } from "@/components/help-tooltip";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StorageHeaderProps {
  icon: LucideIcon;
  title: string;
  tooltip?: string;
  className?: string;
}

export function StorageHeader({ icon: Icon, title, tooltip, className }: StorageHeaderProps) {
  return (
    <div className={cn(
      "flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 animate-fade-in",
      className
    )}>
      <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 transition-all duration-300" />
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <h3 className="text-base sm:text-lg font-medium tracking-tight">
          {title}
        </h3>
        {tooltip && (
          <HelpTooltip
            title="Mais informações"
            description={tooltip}
            icon={true}
          />
        )}
      </div>
    </div>
  );
}
