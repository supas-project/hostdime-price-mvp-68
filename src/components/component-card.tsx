
import { ComponentOption } from "@/data/server-components";
import { Card } from "@/components/ui/card";
import { ComponentSelector } from "./component-selector";
import { DataCenterCard } from "./data-center-card";
import { ContractDuration } from "./contract-duration";
import { ConnectivityOptions } from "./connectivity-options";

interface ComponentCardProps {
  option: ComponentOption;
  isSelected: boolean;
  onSelect: (option: ComponentOption) => void;
  componentType?: string;
  options?: ComponentOption[];
  selectedConnectivityItems?: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateConnectivityItems?: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
}

export function ComponentCard({ 
  option, 
  options = [], 
  isSelected, 
  onSelect,
  componentType,
  selectedConnectivityItems = {},
  onUpdateConnectivityItems
}: ComponentCardProps) {
  // Handle specific component types
  switch (componentType) {
    case "DataCenter":
      return (
        <DataCenterCard
          options={options}
          selectedOption={isSelected ? option : null}
          onSelectOption={onSelect}
        />
      );
      
    case "Contrato":
      return (
        <ContractDuration
          options={options}
          selectedOption={isSelected ? option : null}
          onSelectOption={onSelect}
        />
      );
      
    case "Conectividade":
      if (onUpdateConnectivityItems) {
        return (
          <ConnectivityOptions
            options={options}
            selectedItems={selectedConnectivityItems}
            onUpdateItems={onUpdateConnectivityItems}
          />
        );
      }
      break;
  }
  
  // Default component display
  return (
    <Card 
      className={`p-6 ${isSelected ? 'ring-1 ring-primary' : ''}`}
      onClick={() => option && onSelect(option)}
    >
      <ComponentSelector
        label={option?.name || ""}
        options={[option].filter(Boolean) as ComponentOption[]}
        value={option?.id || ""}
        onChange={() => option && onSelect(option)}
        tooltip={option?.description}
      />
    </Card>
  );
}
