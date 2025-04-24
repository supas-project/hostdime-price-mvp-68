
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { Card } from "@/components/ui/card";
import { HardDrive, Database } from "lucide-react";
import { StorageHeader } from "./storage-header";
import { componentSpacing } from "../ui/shared-styles";
import { cn } from "@/lib/utils";

export function StorageSelector() {
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
      
      <Tabs defaultValue="internal" className="w-full">
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
        
        <TabsContent value="internal">
          <div className="animate-fade-in">
            <InternalStoragePanel />
          </div>
        </TabsContent>
        <TabsContent value="external">
          <div className="animate-fade-in">
            <ExternalStoragePanel />
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
