
import { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface CollapsibleConfigSectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}

export function CollapsibleConfigSection({
  title,
  description,
  icon,
  defaultOpen = false,
  children
}: CollapsibleConfigSectionProps) {
  return (
    <Collapsible defaultOpen={defaultOpen} className="w-full space-y-2">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full flex items-center justify-between p-4 hover:bg-accent rounded-lg"
        >
          <div className="flex items-center gap-2">
            {icon && <div className="text-primary">{icon}</div>}
            <div className="text-left">
              <h3 className="text-lg font-medium">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
          </div>
          <ChevronDown className="h-4 w-4 transition-transform duration-200 collapsible-open:rotate-180" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-4">
        <div className="pt-2 pb-4">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
