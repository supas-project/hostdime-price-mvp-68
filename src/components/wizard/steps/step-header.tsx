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
    return;
  }
  return null;
}