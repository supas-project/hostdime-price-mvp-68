
import { useState } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { StorageHeader } from "./storage-header";
import { componentSpacing } from "../ui/shared-styles";
import { cn } from "@/lib/utils";
import { HardDrive, HelpCircle } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { TabHeader } from "./tab-header/TabHeader";
import { useStorageTypes } from "./hooks/useStorageTypes";
import { useStorageHandlers } from "./handlers/useStorageHandlers";
import { PricedDiskOption } from "@/types/storage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

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
      <div className="absolute right-3 top-3">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Ajuda sobre armazenamento</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-lg">Sobre Armazenamento</h4>
                <p className="text-sm text-muted-foreground">
                  Escolha entre dois tipos de armazenamento para seu servidor:
                </p>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium">Discos Internos</h5>
                <p className="text-sm">
                  Instalados diretamente no servidor. Ideal para o sistema operacional e aplicações.
                </p>
                <div className="grid grid-cols-3 gap-1 text-xs">
                  <Badge variant="outline" className="justify-center">NVMe (rápido)</Badge>
                  <Badge variant="outline" className="justify-center">SSD (médio)</Badge>
                  <Badge variant="outline" className="justify-center">HDD (básico)</Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <h5 className="font-medium">Storage Externo</h5>
                <p className="text-sm">
                  Armazenamento conectado via rede. Perfeito para grande volume de dados e backups.
                </p>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
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
