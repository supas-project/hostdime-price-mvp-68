
import { ComponentOption } from "@/types/component";
import { Card } from "@/components/ui/card";
import { ComponentSelector } from "./component-selector";
import { DataCenterContent } from "./wizard/accordion/content/DataCenterContent";
import { ContractContent } from "./wizard/accordion/content/ContractContent";
import { ConnectivityOptions } from "./connectivity-options";
import { CostPreview } from "./wizard/cost-preview";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";

interface ComponentCardProps {
  option: ComponentOption;
  isSelected: boolean;
  onSelect: (option: ComponentOption) => void;
  componentType?: string;
  options?: ComponentOption[];
  selectedConnectivityItems?: { [key: string]: { option: ComponentOption, quantity: number } };
  onUpdateConnectivityItems?: (items: { [key: string]: { option: ComponentOption, quantity: number } }) => void;
  // Novos props para preview de custos
  showCostPreview?: boolean;
  selectedComponents?: { [key: string]: ComponentOption };
  storageItems?: { internal: ComponentOption[], external: ComponentOption[] };
  customServices?: ComponentOption[];
}

export function ComponentCard({ 
  option, 
  options = [], 
  isSelected, 
  onSelect,
  componentType,
  selectedConnectivityItems = {},
  onUpdateConnectivityItems,
  showCostPreview = false,
  selectedComponents = {},
  storageItems,
  customServices
}: ComponentCardProps) {
  const shouldShowPrice = (type?: string) => {
    return type !== "DataCenter" && type !== "Contrato";
  };

  // Check if option is recommended
  const isRecommended = option?.metadata?.badge === "popular" || 
    option?.metadata?.badge === "recommended" || false;

  // Handle specific component types
  switch (componentType) {
    case "DataCenter":
      return (
        <div className="space-y-4">
          <DataCenterContent
            options={options}
            selectedOption={isSelected ? option : null}
            onSelectOption={onSelect}
          />
          {showCostPreview && (
            <CostPreview 
              selectedComponents={selectedComponents}
              connectivityItems={selectedConnectivityItems}
              storageItems={storageItems}
              customServices={customServices}
            />
          )}
        </div>
      );
      
    case "Contrato":
      return (
        <div className="space-y-4">
          <ContractContent
            options={options}
            selectedOption={isSelected ? option : null}
            onSelectOption={onSelect}
          />
          {showCostPreview && (
            <CostPreview 
              selectedComponents={selectedComponents}
              connectivityItems={selectedConnectivityItems}
              storageItems={storageItems}
              customServices={customServices}
            />
          )}
        </div>
      );
      
    case "Conectividade":
      if (onUpdateConnectivityItems) {
        return (
          <div className="space-y-4">
            <ConnectivityOptions
              options={options}
              selectedItems={selectedConnectivityItems}
              onUpdateItems={onUpdateConnectivityItems}
            />
            {showCostPreview && (
              <CostPreview 
                selectedComponents={selectedComponents}
                connectivityItems={selectedConnectivityItems}
                storageItems={storageItems}
                customServices={customServices}
              />
            )}
          </div>
        );
      }
      break;
  }
  
  // Default component display with enhanced styling
  return (
    <div className="space-y-4">
      <Card 
        className={`p-6 transition-all duration-200 hover:shadow-lg cursor-pointer ${
          isSelected 
            ? 'ring-2 ring-orange-500 bg-orange-50/50 dark:bg-orange-900/10' 
            : 'hover:border-orange-300'
        } ${isRecommended ? 'relative' : ''}`}
        onClick={() => option && onSelect(option)}
      >
        {isRecommended && (
          <div className="absolute -top-2 -right-2 z-10">
            <Badge className="bg-orange-500 text-white flex items-center gap-1 px-2 py-1">
              <Star className="h-3 w-3 fill-current" />
              Recomendado
            </Badge>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className={`font-semibold text-base ${isSelected ? 'text-orange-600 dark:text-orange-400' : ''}`}>
              {option?.name}
            </h3>
            {option?.description && (
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                {option.description}
              </p>
            )}
            
            {option?.specs && option.specs.length > 0 && (
              <div className="mt-3 space-y-1">
                {option.specs.slice(0, 3).map((spec, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                    <span>{spec}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {shouldShowPrice(option?.type) && option?.price !== undefined && (
            <div className="ml-4 text-right">
              <div className={`font-bold text-xl ${
                isSelected || isRecommended 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-primary'
              }`}>
                {formatCurrency(option.price)}
              </div>
              <div className="text-xs text-muted-foreground">por mês</div>
            </div>
          )}
        </div>
      </Card>

      {showCostPreview && (
        <CostPreview 
          selectedComponents={selectedComponents}
          connectivityItems={selectedConnectivityItems}
          storageItems={storageItems}
          customServices={customServices}
        />
      )}
    </div>
  );
}
