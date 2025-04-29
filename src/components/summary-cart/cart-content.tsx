
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
}

export function CartContent({ 
  selectedComponents, 
  storageItems, 
  connectivityItems 
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
  
  return (
    <div className="p-4 space-y-4 max-h-[300px] overflow-auto">
      {/* Data Center */}
      <DataCenterItem component={dataCenterComponent} />
      
      {/* Contract */}
      <ContractItem component={contractComponent} />
      
      {/* Standard components with prices */}
      <StandardComponentList components={standardComponents} />
      
      {/* Internal Storage components */}
      <StorageList storageItems={storageItems.internal} />
      
      {/* External Storage components */}
      <ExternalStorageList storageItems={storageItems.external} />
      
      {/* Connectivity items */}
      <ConnectivityList connectivityItems={connectivityItems} />
    </div>
  );
}
