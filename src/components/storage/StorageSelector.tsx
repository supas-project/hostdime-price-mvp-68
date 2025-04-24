
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { Card } from "@/components/ui/card";
import { HardDrive, Database } from "lucide-react";
import { StorageHeader } from "./storage-header";
import { componentSpacing } from "../ui/shared-styles";
import { cn } from "@/lib/utils";
import { PricedDiskOption } from "@/types/storage";

export interface StorageSelectorProps {
  onSelectInternalDisk?: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage?: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const [activeTab, setActiveTab] = useState<string>("internal");

  return (
    <Card className={cn(
      componentSpacing.card,
      "bg-[#1e1e1e] border-[#2a2a2a] transition-all duration-300"
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
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/5 backdrop-blur-lg border border-[#2a2a2a] rounded-lg overflow-hidden">
          <TabsTrigger 
            value="internal"
            className="relative py-3 data-[state=active]:bg-[#f58220] data-[state=active]:text-white transition-all duration-300"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Discos Internos
          </TabsTrigger>
          <TabsTrigger 
            value="external"
            className="relative py-3 data-[state=active]:bg-[#f58220] data-[state=active]:text-white transition-all duration-300"
          >
            <Database className="w-4 h-4 mr-2" />
            Storage Externo
          </TabsTrigger>
        </TabsList>
        
        <div className="relative z-10">
          <TabsContent value="internal" className="mt-0">
            <div className="animate-fade-in">
              <InternalStoragePanel onSelectDisk={onSelectInternalDisk} />
            </div>
          </TabsContent>
          <TabsContent value="external" className="mt-0">
            <div className="animate-fade-in">
              <ExternalStoragePanel onSelectStorage={onSelectExternalStorage} />
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
}
