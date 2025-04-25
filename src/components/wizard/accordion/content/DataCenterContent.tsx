
import { DataCenterCard } from "@/components/data-center-card";
import { ComponentOption } from "@/types/component";

interface DataCenterContentProps {
  options: ComponentOption[];
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
}

export function DataCenterContent({ 
  options, 
  selectedOption, 
  onSelectOption 
}: DataCenterContentProps) {
  return (
    <DataCenterCard
      options={options}
      selectedOption={selectedOption}
      onSelectOption={onSelectOption}
    />
  );
}
