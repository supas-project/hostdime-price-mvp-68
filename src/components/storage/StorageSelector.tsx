
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { Card } from "@/components/ui/card";
import { HardDrive, Database } from "lucide-react";
import { StorageHeader } from "./storage-header";

export function StorageSelector() {
  return (
    <Card className="p-6 bg-card border-border">
      <StorageHeader
        icon={HardDrive}
        title="Armazenamento"
        tooltip="Escolha o tipo e capacidade de armazenamento ideal para seu servidor"
      />
      
      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
          <TabsTrigger 
            value="internal"
            className="data-[state=active]:bg-background"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Dentro do Servidor
          </TabsTrigger>
          <TabsTrigger 
            value="external"
            className="data-[state=active]:bg-background"
          >
            <Database className="w-4 h-4 mr-2" />
            Storage Externo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="internal" className="mt-0">
          <InternalStoragePanel />
        </TabsContent>
        <TabsContent value="external" className="mt-0">
          <ExternalStoragePanel />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
