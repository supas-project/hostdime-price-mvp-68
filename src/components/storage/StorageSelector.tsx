
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StorageHeader } from "./storage-header";
import { componentSpacing } from "../ui/shared-styles";
import { cn } from "@/lib/utils";
import { HardDrive } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { TabHeader } from "./tab-header/TabHeader";
import { useStorageTypes } from "./hooks/useStorageTypes";
import { useStorageHandlers } from "./handlers/useStorageHandlers";
import { PricedDiskOption } from "@/types/storage";

interface StorageSelectorProps {
  onSelectInternalDisk?: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("internal");
  const { handleSelectStorageItem } = useWizard();
  const storageTypes = useStorageTypes();
  
  const { 
    handleSelectInternalDiskInternal,
    handleSelectExternalStorageInternal
  } = useStorageHandlers({
    onSelectInternalDisk,
    onSelectExternalStorage,
    handleSelectStorageItem
  });

  const handleSelectExternalStorage = (type: string, capacity: number, price: number) => {
    handleSelectExternalStorageInternal(type, capacity, price, storageTypes);
  };

  return (
    <Card className={cn(
      componentSpacing.card,
      "bg-[#1e1e1e] border-[#2a2a2a] transition-all duration-300 relative"
    )}>
      <StorageHeader
        icon={HardDrive}
        title="Armazenamento"
        tooltip="Escolha o tipo e capacidade de armazenamento ideal para seu servidor. Você pode adicionar múltiplos discos internos de diferentes tipos."
      />
      
      <Tabs 
        defaultValue="internal" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
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
              <ExternalStoragePanel 
                onSelectStorage={handleSelectExternalStorage} 
                storageTypes={storageTypes}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
