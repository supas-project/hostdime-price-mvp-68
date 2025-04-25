import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { Card } from "@/components/ui/card";
import { StorageHeader } from "./storage-header";
import { componentSpacing } from "../ui/shared-styles";
import { cn } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";
import { TabHeader } from "./tab-header/TabHeader";
import { HardDrive } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { ComponentOption } from "@/data/server-components";

interface StorageSelectorProps {
  onSelectInternalDisk?: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("internal");
  const { handleSelectStorageItem } = useWizard();

  const handleSelectInternalDiskInternal = (disk: PricedDiskOption, quantity: number) => {
    const storageOption: ComponentOption = {
      id: `internal-disk-${disk.id}`,
      type: "Armazenamento",
      name: `${quantity}x ${disk.type.toUpperCase()} ${disk.capacity}`,
      description: `Disco interno: ${disk.type.toUpperCase()} ${disk.capacity}`,
      price: disk.price * quantity,
      specs: [
        `Tipo: ${disk.type.toUpperCase()}`,
        `Capacidade: ${disk.capacity}`,
        `Quantidade: ${quantity}`
      ]
    };
    
    // Use the passed prop if available, otherwise use context function
    if (onSelectInternalDisk) {
      onSelectInternalDisk(disk, quantity);
    } else {
      handleSelectStorageItem(storageOption, 'internal');
    }
  };

  const handleSelectExternalStorageInternal = (type: string, capacity: number, price: number) => {
    const storageOption: ComponentOption = {
      id: `external-storage-${type}-${capacity}`,
      type: "Armazenamento",
      name: `Storage ${type} ${capacity} GB`,
      description: `Storage externo: ${type} ${capacity} GB`,
      price: price,
      specs: [
        `Tipo: Storage ${type}`,
        `Capacidade: ${capacity} GB`
      ]
    };
    
    // Use the passed prop if available, otherwise use context function
    if (onSelectExternalStorage) {
      onSelectExternalStorage(type, capacity, price);
    } else {
      handleSelectStorageItem(storageOption, 'external');
    }
  };

  return (
    <Card className={cn(
      componentSpacing.card,
      "bg-[#1e1e1e] border-[#2a2a2a] transition-all duration-300 relative"
    )}>
      <StorageHeader
        icon={HardDrive}
        title="Armazenamento"
        tooltip="Escolha o tipo e capacidade de armazenamento ideal para seu servidor"
      />
      
      <Tabs 
        defaultValue="internal" 
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="relative">
          <TabsContent value="internal" className="mt-0 relative z-10">
            <div className="animate-fade-in">
              <InternalStoragePanel onSelectDisk={handleSelectInternalDiskInternal} />
            </div>
          </TabsContent>
          <TabsContent value="external" className="mt-0 relative z-10">
            <div className="animate-fade-in">
              <ExternalStoragePanel onSelectStorage={handleSelectExternalStorageInternal} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
