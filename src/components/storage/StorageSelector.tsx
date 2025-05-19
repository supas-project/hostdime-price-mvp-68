
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StorageHeader } from "./storage-header";
import { componentSpacing } from "../ui/shared-styles";
import { cn } from "@/lib/utils";
import { HardDrive, Info } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { TabHeader } from "./tab-header/TabHeader";
import { useStorageTypes, StorageType } from "./hooks/useStorageTypes";
import { useStorageHandlers } from "./handlers/useStorageHandlers";
import { PricedDiskOption } from "@/types/storage";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StorageSelectorProps {
  onSelectInternalDisk?: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("internal");
  const [selectedDiskType, setSelectedDiskType] = useState<string | null>(null);
  const { handleSelectStorageItem } = useWizard();
  const storageTypes = useStorageTypes();
  const [showHelp, setShowHelp] = useState(true);
  
  const { 
    handleSelectInternalDiskInternal,
    handleSelectExternalStorageInternal
  } = useStorageHandlers({
    onSelectInternalDisk,
    onSelectExternalStorage,
    handleSelectStorageItem
  });

  // Modified to mark all storage components as hardware and track disk type
  const handleSelectInternalDisk = (disk: PricedDiskOption, quantity: number) => {
    // Track the selected disk type for RAID compatibility display
    setSelectedDiskType(disk.type.toLowerCase());
    
    // Mark the disk as hardware before passing it
    const diskWithHardwareFlag = { ...disk, isHardware: true };
    handleSelectInternalDiskInternal(diskWithHardwareFlag, quantity);
  };

  const handleSelectExternalStorage = (type: string, capacity: number, price: number) => {
    // The useStorageHandlers will create a ComponentOption, we'll mark it as hardware there
    handleSelectExternalStorageInternal(type, capacity, price, storageTypes);
  };

  const storageDescriptions = {
    internal: "Os discos internos são instalados dentro do seu servidor físico. Escolha entre discos NVMe (mais rápidos), SSDs (equilíbrio entre velocidade e custo) ou HDDs (mais capacidade por custo).",
    external: "Armazenamento externo é acessado pela rede, oferecendo flexibilidade para aumentar espaço sem modificar o servidor físico."
  };

  const isNVMe = selectedDiskType === 'nvme';

  // Convert the storage types array to object format expected by ExternalStoragePanel
  const formattedStorageTypes: {[key: string]: any} = {};
  
  storageTypes.forEach(type => {
    formattedStorageTypes[type.id] = {
      name: type.name,
      pricePerGB: type.price / 100, // Assuming price is per 100GB
      iops: type.specs.find(s => s.toLowerCase().includes('iops'))?.split(': ')[1] || 'N/A',
      throughput: type.specs.find(s => s.toLowerCase().includes('throughput'))?.split(': ')[1] || 'N/A',
      description: type.description,
      throughputAdd: 0, // Default value
      maxThroughput: type.specs.find(s => s.toLowerCase().includes('max'))?.split(': ')[1] || 'N/A'
    };
  });

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
      
      {showHelp && (
        <Alert className="mb-3 sm:mb-4 bg-primary/5 border-primary/20 text-foreground">
          <AlertDescription className="text-xs sm:text-sm">
            <strong>Dica:</strong> Para a maioria dos sites e aplicações, recomendamos 2 discos SSD (um para sistema e outro para dados) 
            ou 1 disco NVMe para máximo desempenho.
            <button 
              onClick={() => setShowHelp(false)} 
              className="text-xs text-primary hover:underline ml-2"
            >
              Entendi
            </button>
          </AlertDescription>
        </Alert>
      )}

      {isNVMe && (
        <Alert className="mb-3 bg-[#f58220]/5 border-[#f58220]/20 text-foreground">
          <Info className="h-4 w-4 text-[#f58220]" />
          <AlertDescription className="text-xs sm:text-sm ml-2">
            <strong>Nota:</strong> Discos NVMe são compatíveis apenas com configuração RAID por software.
            Hardware RAID não está disponível para este tipo de disco.
          </AlertDescription>
        </Alert>
      )}

      <Tabs 
        defaultValue="internal" 
        className="w-full"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabHeader activeTab={activeTab} onTabChange={setActiveTab} />
        
        {activeTab === "internal" && (
          <div className="text-xs text-muted-foreground mt-1 mb-3">
            {storageDescriptions.internal}
          </div>
        )}
        
        {activeTab === "external" && (
          <div className="text-xs text-muted-foreground mt-1 mb-3">
            {storageDescriptions.external}
          </div>
        )}
        
        <div className="relative">
          <TabsContent value="internal" className="mt-0 relative z-10">
            <div className="animate-fade-in">
              <InternalStoragePanel onSelectDisk={handleSelectInternalDisk} />
            </div>
          </TabsContent>
          <TabsContent value="external" className="mt-0 relative z-10">
            <div className="animate-fade-in">
              <ExternalStoragePanel 
                onSelectStorage={handleSelectExternalStorage} 
                storageTypes={formattedStorageTypes}
              />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
