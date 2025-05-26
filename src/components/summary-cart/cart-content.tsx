
import React from 'react';
import { ComponentOption } from "@/types/component";
import { Button } from "@/components/ui/button";
import { Trash2, Settings2, HardDrive, Database, Network, Zap } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { usePayBackCalculation } from "@/hooks/usePayBackCalculation";
import { useWizard } from "@/contexts/WizardContext";

interface CartContentProps {
  selectedComponents: { [key: string]: ComponentOption };
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] };
  connectivityItems: { [key: string]: { option: ComponentOption; quantity: number } };
  onRemoveItem: (itemId: string) => void;
}

export function CartContent({
  selectedComponents,
  storageItems,
  connectivityItems,
  onRemoveItem
}: CartContentProps) {
  const { selectedContractOption } = useWizard();
  const { 
    calculateMonthlyCostWithPayBack, 
    isEligibleForPayBack, 
    formatCurrency: formatBRL 
  } = usePayBackCalculation();

  // Get contract duration from selected contract option
  const contractDuration = selectedContractOption?.id === "contrato-indeterminado" 
    ? "0" 
    : selectedContractOption?.id?.replace("contrato-", "") || "0";

  console.log("[CartContent] Contract duration:", contractDuration);

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'Processador':
        return <Zap className="h-4 w-4 text-primary" />;
      case 'Memória':
        return <Database className="h-4 w-4 text-blue-500" />;
      case 'Armazenamento Interno':
        return <HardDrive className="h-4 w-4 text-green-500" />;
      case 'DataCenter':
        return <Settings2 className="h-4 w-4 text-purple-500" />;
      case 'Contrato':
        return <Settings2 className="h-4 w-4 text-orange-500" />;
      default:
        return <Settings2 className="h-4 w-4 text-gray-500" />;
    }
  };

  const renderComponentItem = (component: ComponentOption, key: string) => {
    const isPayBackEligible = isEligibleForPayBack(component);
    const displayPrice = isPayBackEligible 
      ? calculateMonthlyCostWithPayBack(component, contractDuration)
      : component.price;

    console.log(`[CartContent] Component ${component.name}: eligible=${isPayBackEligible}, original=${component.price}, display=${displayPrice}`);

    return (
      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {getComponentIcon(component.type)}
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{component.name}</div>
            <div className="text-xs text-muted-foreground">{component.type}</div>
            {isPayBackEligible && (
              <div className="text-xs text-primary font-medium">
                PayBack aplicado
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="font-bold text-sm">
              {formatCurrency(displayPrice)}
            </div>
            <div className="text-xs text-muted-foreground">mensal</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(key)}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStorageItem = (item: ComponentOption, index: number, type: 'internal' | 'external') => {
    const isPayBackEligible = type === 'internal' && isEligibleForPayBack({ ...item, type: 'Armazenamento Interno' });
    const displayPrice = isPayBackEligible 
      ? calculateMonthlyCostWithPayBack({ ...item, type: 'Armazenamento Interno' }, contractDuration)
      : item.price;

    console.log(`[CartContent] Storage ${item.name}: type=${type}, eligible=${isPayBackEligible}, original=${item.price}, display=${displayPrice}`);

    return (
      <div key={`${type}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <HardDrive className="h-4 w-4 text-green-500" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate">{item.name}</div>
            <div className="text-xs text-muted-foreground">
              {type === 'internal' ? 'Disco Interno' : 'Storage Externo'}
            </div>
            {isPayBackEligible && (
              <div className="text-xs text-primary font-medium">
                PayBack aplicado
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="font-bold text-sm">
              {formatCurrency(displayPrice)}
            </div>
            <div className="text-xs text-muted-foreground">mensal</div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemoveItem(`${type}-storage-${index}`)}
            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  const standardComponents = Object.entries(selectedComponents).filter(
    ([key, component]) => component && !['DataCenter', 'Contrato', 'Armazenamento'].includes(component.type)
  );

  const hasAnyItems = Boolean(
    standardComponents.length || 
    storageItems.internal.length || 
    storageItems.external.length ||
    Object.keys(connectivityItems).length
  );

  if (!hasAnyItems) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-muted-foreground">
          <Settings2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Nenhum componente selecionado</p>
          <p className="text-xs mt-1">Configure seu servidor para ver o resumo</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4">
      <div className="space-y-3">
        {/* Standard Components */}
        {standardComponents.map(([key, component]) => 
          renderComponentItem(component, key)
        )}

        {/* Internal Storage */}
        {storageItems.internal.map((item, index) => 
          renderStorageItem(item, index, 'internal')
        )}

        {/* External Storage */}
        {storageItems.external.map((item, index) => 
          renderStorageItem(item, index, 'external')
        )}

        {/* Connectivity Items */}
        {Object.entries(connectivityItems).map(([key, { option, quantity }]) => (
          <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <Network className="h-4 w-4 text-blue-500" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{option.name}</div>
                <div className="text-xs text-muted-foreground">
                  Conectividade • Qtd: {quantity}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-bold text-sm">
                  {formatCurrency(option.price * quantity)}
                </div>
                <div className="text-xs text-muted-foreground">mensal</div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(key)}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
