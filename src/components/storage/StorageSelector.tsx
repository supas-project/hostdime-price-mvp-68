
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { Card } from "@/components/ui/card";
import { HardDrive, Database } from "lucide-react";
import { StorageHeader } from "./storage-header";
import { componentSpacing, animationClasses } from "../ui/shared-styles";

export function StorageSelector() {
  return (
    <Card className={`${componentSpacing.card} bg-card border-border transition-all duration-300 hover:shadow-xl`}>
      <StorageHeader
        icon={HardDrive}
        title="Armazenamento"
        tooltip="Escolha o tipo e capacidade de armazenamento ideal para seu servidor"
      />
      
      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6 bg-background/50 backdrop-blur border border-border rounded-lg overflow-hidden">
          <TabsTrigger 
            value="internal"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative py-3 transition-all duration-300"
          >
            <HardDrive className="w-4 h-4 mr-2" />
            Discos Internos
          </TabsTrigger>
          <TabsTrigger 
            value="external"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground relative py-3 transition-all duration-300"
          >
            <Database className="w-4 h-4 mr-2" />
            Storage Externo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="internal" className={`mt-0 ${animationClasses.fadeIn}`}>
          <InternalStoragePanel />
        </TabsContent>
        <TabsContent value="external" className={`mt-0 ${animationClasses.fadeIn}`}>
          <ExternalStoragePanel />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
