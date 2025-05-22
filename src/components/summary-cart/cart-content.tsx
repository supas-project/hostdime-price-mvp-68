
import React from 'react';
import { ComponentOption } from "@/types/component";
import { DataCenterItem } from "./data-center-item";
import { ContractItem } from "./contract-item";
import { StandardComponentList } from "./standard-component-list";
import { StorageList } from "./storage-list";
import { ExternalStorageList } from "./external-storage-list";
import { ConnectivityList } from "./connectivity-list";
import { StorageItems } from "@/types/component";
import { cn } from "@/lib/utils";
import { deduplicateStorageItems } from "@/utils/html/price-calculator";

interface CartContentProps {
  selectedComponents: { [key: string]: ComponentOption };
  storageItems: StorageItems;
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } };
  onRemoveItem?: (type: string) => void;
}

export function CartContent({ 
  selectedComponents, 
  storageItems, 
  connectivityItems,
  onRemoveItem
}: CartContentProps) {
  // CORREÇÃO: Deduplica mais agressivamente os itens de armazenamento
  // Isso garante que não haja duplicatas, mesmo com chamadas repetidas ou IDs diferentes
  const uniqueStorageItems = {
    internal: deduplicateStorageItems(storageItems.internal),
    external: deduplicateStorageItems(storageItems.external)
  };
  
  // Log para debug
  console.log(`[CartContent] Discos internos originais: ${storageItems.internal.length}, únicos: ${uniqueStorageItems.internal.length}`);
  console.log(`[CartContent] Storage externos originais: ${storageItems.external.length}, únicos: ${uniqueStorageItems.external.length}`);
  
  // Separate components by type - CORREÇÃO: Buscar pelo tipo correto
  // Estas são as chaves corretas para cada tipo específico de componente
  const dataCenterComponent = selectedComponents["datacenter"] || selectedComponents["DataCenter"];
  const contractComponent = selectedComponents["contrato"] || selectedComponents["Contrato"];
  
  // Log para debug dos componentes de Data Center e Contrato
  console.log("[CartContent] Data Center Component:", dataCenterComponent);
  console.log("[CartContent] Contract Component:", contractComponent);
  
  // Filter other components (excluding DataCenter, Contract and Storage)
  const standardComponents = Object.values(selectedComponents).filter(
    component => {
      if (!component || component.type === "DataCenter" || component.type === "Contrato" || component.type === "Armazenamento") {
        return false;
      }
      return true;
    }
  );

  // Check if there are any components or items to display
  const hasItems = Boolean(
    standardComponents.length || 
    uniqueStorageItems.internal.length || 
    uniqueStorageItems.external.length ||
    Object.keys(connectivityItems).length
  );
  
  if (!hasItems && !dataCenterComponent && !contractComponent) {
    return (
      <div className="px-3 sm:px-4 py-4 sm:py-6 text-center text-muted-foreground">
        Nenhum componente selecionado
      </div>
    );
  }
  
  return (
    <div className={cn(
      "p-3 space-y-2.5 sm:space-y-3 overflow-y-auto flex-1 text-xs sm:text-sm",
      "scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
    )}>
      {/* Data Center - CORREÇÃO: Mover console.log para fora do JSX */}
      {(() => {
        console.log("[CartContent] Renderizando DataCenterItem com:", dataCenterComponent);
        return dataCenterComponent ? <DataCenterItem component={dataCenterComponent} /> : null;
      })()}
      
      {/* Contract - CORREÇÃO: Mover console.log para fora do JSX */}
      {(() => {
        console.log("[CartContent] Renderizando ContractItem com:", contractComponent);
        return contractComponent ? <ContractItem component={contractComponent} /> : null;
      })()}
      
      {/* Standard components with prices */}
      <StandardComponentList 
        components={standardComponents} 
        onRemoveItem={onRemoveItem}
      />
      
      {/* Internal Storage components - SEMPRE usar lista deduplicada */}
      <StorageList 
        storageItems={uniqueStorageItems.internal} 
        onRemoveItem={onRemoveItem}
      />
      
      {/* External Storage components - SEMPRE usar lista deduplicada */}
      <ExternalStorageList 
        storageItems={uniqueStorageItems.external} 
        onRemoveItem={onRemoveItem}
      />
      
      {/* Connectivity items */}
      <ConnectivityList 
        connectivityItems={connectivityItems} 
        onRemoveItem={onRemoveItem}
      />
    </div>
  );
}
