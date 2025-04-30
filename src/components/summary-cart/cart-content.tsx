
import React from 'react';
import { ComponentOption } from "@/types/component";
import { DataCenterItem } from "./data-center-item";
import { ContractItem } from "./contract-item";
import { StandardComponentList } from "./standard-component-list";
import { StorageList } from "./storage-list";
import { ExternalStorageList } from "./external-storage-list";
import { ConnectivityList } from "./connectivity-list";
import { StorageItems } from "@/types/component";

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
  // Separate components by type
  const dataCenterComponent = selectedComponents["datacenter"];
  const contractComponent = selectedComponents["contrato"];
  
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
    storageItems.internal.length || 
    storageItems.external.length ||
    Object.keys(connectivityItems).length
  );
  
  if (!hasItems && !dataCenterComponent && !contractComponent) {
    return (
      <div className="px-4 py-6 text-center text-muted-foreground">
        Nenhum componente selecionado
      </div>
    );
  }
  
  return (
    <div className="p-3 space-y-3 overflow-y-auto flex-1 text-sm">
      {/* Data Center */}
      <DataCenterItem component={dataCenterComponent} />
      
      {/* Contract */}
      <ContractItem component={contractComponent} />
      
      {/* Standard components with prices */}
      <StandardComponentList 
        components={standardComponents} 
        onRemoveItem={onRemoveItem}
      />
      
      {/* Internal Storage components */}
      <StorageList 
        storageItems={storageItems.internal} 
        onRemoveItem={onRemoveItem}
      />
      
      {/* External Storage components */}
      <ExternalStorageList 
        storageItems={storageItems.external} 
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
