
import { ServerComponent, ComponentOption } from "@/types/component";
import { ComponentSelector } from "@/components/component-selector";
import { DataCenterCard } from "@/components/data-center-card";
import { ContractDuration } from "@/components/contract-duration";
import { ConnectivityOptions } from "@/components/connectivity-options";
import { StorageStep } from "@/components/wizard/steps/storage/storage-step";
import { MemorySlider } from "@/components/memory-slider";
import { StepHeader } from "@/components/wizard/steps/step-header";
import { Card } from "@/components/ui/card";

interface AccordionContentProps {
  component: ServerComponent;
  selectedOption: ComponentOption | null;
  onSelectOption: (option: ComponentOption) => void;
  connectivityItems?: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateConnectivityItems?: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
  onSelectStorageItem?: (storageOption: ComponentOption, storageType: 'internal' | 'external') => void;
}

export function AccordionContent({
  component,
  selectedOption,
  onSelectOption,
  connectivityItems,
  onUpdateConnectivityItems,
  onSelectStorageItem
}: AccordionContentProps) {
  const isSpecialComponentType = ["DataCenter", "Contrato", "Conectividade", "Armazenamento", "Memória"].includes(component.type);

  const renderComponentContent = () => {
    switch (component.type) {
      case "Processador":
        return (
          <ComponentSelector
            label={component.friendlyName}
            options={component.options}
            value={selectedOption?.id || ""}
            onChange={(value) => {
              const option = component.options.find(opt => opt.id === value);
              if (option) onSelectOption(option);
            }}
            tooltip={component.description}
            highlightSelection={true}
          />
        );
      
      case "Memória":
        return (
          <Card className="p-6">
            <MemorySlider 
              value={selectedOption?.name 
                ? parseInt(selectedOption.name.replace(/\D/g, '')) || 8 
                : 8}
              onChange={(newValue) => {
                const updatedOption = {
                  ...component.options[0],
                  price: newValue * 7.5,
                  name: `${newValue}GB RAM`
                };
                onSelectOption(updatedOption);
              }}
              pricePerGB={7.5}
            />
          </Card>
        );
      
      case "DataCenter":
        return (
          <DataCenterCard
            options={component.options}
            selectedOption={selectedOption}
            onSelectOption={onSelectOption}
          />
        );
      
      case "Contrato":
        return (
          <ContractDuration
            options={component.options}
            selectedOption={selectedOption}
            onSelectOption={onSelectOption}
          />
        );
      
      case "Conectividade":
        if (onUpdateConnectivityItems) {
          return (
            <ConnectivityOptions
              options={component.options}
              selectedItems={connectivityItems || {}}
              onUpdateItems={onUpdateConnectivityItems}
            />
          );
        }
        break;

      case "Armazenamento":
        if (onSelectStorageItem) {
          return <StorageStep onSelectStorageItem={onSelectStorageItem} />;
        }
        break;

      default:
        return null;
    }
  };

  return (
    <>
      <StepHeader 
        description={component.description}
        isSpecialComponent={isSpecialComponentType}
        hasSelectedOption={!!selectedOption}
      />
      {renderComponentContent()}
    </>
  );
}
