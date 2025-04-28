import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { ComponentSelector } from "./component-selector";
import { DataCenterContent } from "./wizard/accordion/content/DataCenterContent";
import { ContractContent } from "./wizard/accordion/content/ContractContent";
import { ConnectivityOptions } from "./connectivity-options";
import { formatCurrency } from "@/lib/utils";

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
  const shouldShowPrice = (type?: string) => {
    return type !== "DataCenter" && type !== "Contrato";
  };

  // Handle specific component types
  switch (componentType) {
    case "DataCenter":
      return (
        <DataCenterContent
          options={options}
          selectedOption={isSelected ? option : null}
          onSelectOption={onSelect}
        />
      );
      
    case "Contrato":
      return (
        <ContractContent
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
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="font-medium">{option?.name}</h3>
          {option?.description && (
            <p className="text-sm text-muted-foreground">{option.description}</p>
          )}
        </div>
        {shouldShowPrice(option?.type) && option?.price !== undefined && (
          <span className="font-medium text-primary">
            {formatCurrency(option.price)}
          </span>
        )}
      </div>
    </Card>
  );
}
