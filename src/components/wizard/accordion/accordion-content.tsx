
import { ServerComponent, ComponentOption } from "@/types/component";
import { StepHeader } from "@/components/wizard/steps/step-header";
import { ProcessorContent } from "./content/ProcessorContent";
import { MemoryContent } from "./content/MemoryContent";
import { DataCenterContent } from "./content/DataCenterContent";
import { ContractContent } from "./content/ContractContent";
import { ConnectivityContent } from "./content/ConnectivityContent";
import { StorageContent } from "./content/StorageContent";
import { OSContent } from "./content/OSContent";
import { CustomServicesContent } from "./content/CustomServicesContent";
import { findMatchingComponent } from "@/utils/component-matching";

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
  const isSpecialComponentType = ["DataCenter", "Contrato", "Conectividade", "Armazenamento", "Memória", "SistemaOperacional", "ServiçosPersonalizados"].includes(component.type);

  // Try to find a matching option in the component options if needed
  const matchedSelectedOption = selectedOption && component.options.length > 0 
    ? findMatchingComponent(selectedOption, component.options) || selectedOption 
    : selectedOption;

  const renderComponentContent = () => {
    switch (component.type) {
      case "Processador":
        return (
          <ProcessorContent
            selectedOption={matchedSelectedOption}
            onSelectOption={onSelectOption}
          />
        );
      
      case "Memória":
        return (
          <MemoryContent
            selectedOption={matchedSelectedOption}
            onSelectOption={onSelectOption}
          />
        );
      
      case "DataCenter":
        return (
          <DataCenterContent
            options={component.options}
            selectedOption={matchedSelectedOption}
            onSelectOption={onSelectOption}
          />
        );
      
      case "Contrato":
        return (
          <ContractContent
            options={component.options}
            selectedOption={matchedSelectedOption}
            onSelectOption={onSelectOption}
          />
        );
      
      case "Conectividade":
        if (onUpdateConnectivityItems) {
          return (
            <ConnectivityContent
              options={component.options}
              connectivityItems={connectivityItems || {}}
              onUpdateConnectivityItems={onUpdateConnectivityItems}
            />
          );
        }
        break;

      case "Armazenamento":
        if (onSelectStorageItem) {
          return <StorageContent onSelectStorageItem={onSelectStorageItem} />;
        }
        break;
      
      case "SistemaOperacional":
        return (
          <OSContent
            selectedOption={matchedSelectedOption}
            onSelectOption={onSelectOption}
          />
        );
        
      case "ServiçosPersonalizados":
        return <CustomServicesContent />;

      default:
        return null;
    }
  };

  return (
    <div className="animate-fade-in">
      <StepHeader 
        description={component.description}
        isSpecialComponent={isSpecialComponentType}
        hasSelectedOption={!!matchedSelectedOption}
      />
      {renderComponentContent()}
    </div>
  );
}
