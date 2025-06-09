
import { useState } from "react";
import { useAuth } from "@/contexts/auth/UnifiedAuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WizardProvider } from "@/contexts/wizard";
import { WizardContent } from "@/components/wizard/WizardContent";
import { DataSyncPanel } from "@/components/data-sync/DataSyncPanel";
import { DataComparisonPanel } from "@/components/data-sync/DataComparisonPanel";
import { Settings, Cog, Database, GitCompare } from "lucide-react";

export default function Configure() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("wizard");

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Configuração do Sistema
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Configure servidores, compare dados e mantenha tudo sincronizado
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="wizard" className="flex items-center gap-2">
                <Cog className="w-4 h-4" />
                Configurar Servidor
              </TabsTrigger>
              <TabsTrigger value="comparison" className="flex items-center gap-2">
                <GitCompare className="w-4 h-4" />
                Comparar Dados
              </TabsTrigger>
              <TabsTrigger value="sync" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Sincronização
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wizard" className="mt-6">
              <WizardProvider>
                <WizardContent />
              </WizardProvider>
            </TabsContent>

            <TabsContent value="comparison" className="mt-6">
              <div className="max-w-4xl mx-auto">
                <DataComparisonPanel />
              </div>
            </TabsContent>

            <TabsContent value="sync" className="mt-6">
              <div className="max-w-2xl mx-auto">
                <DataSyncPanel />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
