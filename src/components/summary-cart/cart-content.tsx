
import React, { useEffect } from 'react';
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
  const uniqueStorageItems = {
    internal: deduplicateStorageItems(storageItems.internal),
    external: deduplicateStorageItems(storageItems.external)
  };
  
  // Log para debug
  console.log(`[CartContent] Discos internos originais: ${storageItems.internal.length}, únicos: ${uniqueStorageItems.internal.length}`);
  console.log(`[CartContent] Storage externos originais: ${storageItems.external.length}, únicos: ${uniqueStorageItems.external.length}`);
  
  // Separate components by type - CORREÇÃO: Buscar pelo tipo correto
  // Estas são as chaves corretas para cada tipo específico de componente
  const dataCenterComponent = selectedComponents["datacenter"];
  const contractComponent = selectedComponents["contrato"];
  
  // Log para debug dos componentes
  useEffect(() => {
    console.log("[CartContent] Componentes selecionados atualizados:", 
      Object.keys(selectedComponents).length ? Object.keys(selectedComponents).join(", ") : "nenhum");
  }, [selectedComponents]);
  
  // Filter other components (excluding DataCenter, Contract and Storage)
  const standardComponents = Object.values(selectedComponents).filter(
    component => {
      // CORREÇÃO: Verificar tanto pelo tipo em si quanto pelo tipo lowercase
      const type = component?.type?.toLowerCase();
      if (!component || 
          type === "datacenter" || 
          type === "contrato" || 
          type === "armazenamento") {
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
      {/* Data Center - CORREÇÃO: Verificar que tipo está em lowercase */}
      {dataCenterComponent && <DataCenterItem component={dataCenterComponent} />}
      
      {/* Contract - CORREÇÃO: Verificar que tipo está em lowercase */}
      {contractComponent && <ContractItem component={contractComponent} />}
      
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
