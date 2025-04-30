
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
import { Alert, AlertDescription } from "@/components/ui/alert";

interface StorageSelectorProps {
  onSelectInternalDisk?: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("internal");
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

  const handleSelectExternalStorage = (type: string, capacity: number, price: number) => {
    handleSelectExternalStorageInternal(type, capacity, price, storageTypes);
  };

  const storageDescriptions = {
    internal: "Os discos internos são instalados dentro do seu servidor físico. Escolha entre discos NVMe (mais rápidos), SSDs (equilíbrio entre velocidade e custo) ou HDDs (mais capacidade por custo).",
    external: "Armazenamento externo é acessado pela rede, oferecendo flexibilidade para aumentar espaço sem modificar o servidor físico."
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
      
      {showHelp && (
        <Alert className="mb-4 bg-primary/5 border-primary/20 text-foreground">
          <AlertDescription className="text-sm">
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
