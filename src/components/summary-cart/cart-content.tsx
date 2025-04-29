
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
      <div className="p-4 text-center text-muted-foreground">
        Nenhum componente selecionado
      </div>
    );
  }
  
  return (
    <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
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
        onRemoveItem={onRemoveItem ? (diskId) => onRemoveItem(`internal-disk-${diskId}`) : undefined}
      />
      
      {/* External Storage components */}
      <ExternalStorageList 
        storageItems={storageItems.external} 
        onRemoveItem={onRemoveItem ? (storageId) => onRemoveItem(`external-storage-${storageId}`) : undefined}
      />
      
      {/* Connectivity items */}
      <ConnectivityList 
        connectivityItems={connectivityItems} 
        onRemoveItem={onRemoveItem}
      />
    </div>
  );
}
