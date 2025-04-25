
import { ContractDuration } from "@/components/contract-duration";
import { ComponentOption } from "@/types/component";

interface ContractContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function ContractContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: ContractContentProps) {
  return (
    <ContractDuration
      options={options}
      selectedOption={selectedOption}
      onSelectOption={onSelectOption}
    />
  );
}
