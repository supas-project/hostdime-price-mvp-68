
import { useState } from "react";
import { useAuth } from "@/contexts/auth/UnifiedAuthContext";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WizardProvider } from "@/contexts/wizard";
import { WizardContent } from "@/components/wizard/WizardContent";
import { DataSyncPanel } from "@/components/data-sync/DataSyncPanel";
import { Settings, Cog, Database } from "lucide-react";

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
              Configure servidores e mantenha os dados sincronizados entre configuração e tabela de preços
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="wizard" className="flex items-center gap-2">
                <Cog className="w-4 h-4" />
                Configurar Servidor
              </TabsTrigger>
              <TabsTrigger value="sync" className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Sincronização de Dados
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wizard" className="mt-6">
              <WizardProvider>
                <WizardContent />
              </WizardProvider>
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
