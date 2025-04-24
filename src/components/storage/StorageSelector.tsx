
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { Card } from "@/components/ui/card";
import { HardDrive, Database } from "lucide-react";
import { StorageHeader } from "./storage-header";

export function StorageSelector() {
  return (
    <Card className="p-6 bg-card border-border shadow-lg transition-shadow hover:shadow-xl">
      <StorageHeader
        icon={HardDrive}
        title="Armazenamento"
        tooltip="Escolha o tipo e capacidade de armazenamento ideal para seu servidor"
      />
      
      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-background border border-border">
          <TabsTrigger 
            value="internal"
            className="data-[state=active]:bg-[#f58220] data-[state=active]:text-white relative py-3 transition-all"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Discos Internos
          </TabsTrigger>
          <TabsTrigger 
            value="external"
            className="data-[state=active]:bg-[#f58220] data-[state=active]:text-white relative py-3 transition-all"
          >
            <Database className="w-4 h-4 mr-2" />
            Storage Externo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="internal" className="mt-0 animate-fade-in">
          <InternalStoragePanel />
        </TabsContent>
        <TabsContent value="external" className="mt-0 animate-fade-in">
          <ExternalStoragePanel />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
