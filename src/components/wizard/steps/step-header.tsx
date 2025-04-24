
import { HelpTooltip } from "@/components/help-tooltip";

interface StepHeaderProps {
  description: string;
  isSpecialComponent: boolean;
  hasSelectedOption: boolean;
}

export function StepHeader({ description, isSpecialComponent, hasSelectedOption }: StepHeaderProps) {
  if (!hasSelectedOption && !isSpecialComponent) {
    return (
      <p className="text-muted-foreground flex items-center mb-4">
        {description}
        <HelpTooltip 
          title="Mais detalhes" 
          description={description} 
        />
      </p>
    );
  }
  return null;
}
