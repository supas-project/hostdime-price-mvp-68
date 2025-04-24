
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InternalStoragePanel } from "./InternalStoragePanel";
import { ExternalStoragePanel } from "./ExternalStoragePanel";
import { Card } from "@/components/ui/card";

export function StorageSelector() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="internal" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="internal">Dentro do Servidor</TabsTrigger>
          <TabsTrigger value="external">Externo (Storage)</TabsTrigger>
        </TabsList>
        <TabsContent value="internal">
          <InternalStoragePanel />
        </TabsContent>
        <TabsContent value="external">
          <ExternalStoragePanel />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
