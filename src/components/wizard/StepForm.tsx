
import { ServerComponent, ComponentOption } from "@/types/component";
import { AccordionStep } from "@/components/accordion-step";
import { WizardStep } from "@/components/wizard-step";

interface StepFormProps {
  component: ServerComponent;
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
  connectivityItems?: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateConnectivityItems?: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
  onSelectStorageItem?: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function StepForm({
  component,
  selectedOption,
  onSelectOption,
  connectivityItems,
  onUpdateConnectivityItems,
  onSelectStorageItem
}: StepFormProps) {
  // Use WizardStep for modern view
  return (
    <WizardStep 
      component={component}
      selectedOption={selectedOption}
      onSelectOption={onSelectOption}
    />
  );
}
