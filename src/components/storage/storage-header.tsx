
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
    <div className={cn("flex items-center gap-2 mb-6", className)}>
      <Icon className="h-5 w-5 text-[#f58220]" />
      <h3 className="text-lg font-medium">
        {title}
        {tooltip && (
          <HelpTooltip
            title="Mais informações"
            description={tooltip}
            icon={true}
          />
        )}
      </h3>
    </div>
  );
}
