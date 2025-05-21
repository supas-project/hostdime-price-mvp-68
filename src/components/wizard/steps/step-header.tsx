
import { HelpTooltip } from "@/components/help-tooltip";

interface StepHeaderProps {
  description: string;
  isSpecialComponent: boolean;
  hasSelectedOption: boolean;
}

export function StepHeader({
  description,
  isSpecialComponent,
  hasSelectedOption
}: StepHeaderProps) {
  if (!hasSelectedOption && !isSpecialComponent) {
    return null;
  }
  
  return (
    <div className="mb-4 flex items-start">
      <p className="text-sm text-muted-foreground pr-2">{description}</p>
      <HelpTooltip content="Selecione uma opção para configurar este componente" />
    </div>
  );
}
