
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Database, HardDrive, Cpu, MemoryStick, Globe, Server, Settings } from 'lucide-react';
import { useUnifiedData } from '@/hooks/useUnifiedData';
import { SystemComponentsTable } from './SystemComponentsTable';
import { CreateComponentDialog } from './CreateComponentDialog';
import { MigrationButton } from './MigrationButton';
import { ProductionDashboard } from './ProductionDashboard';
import { UnifiedComponent, UnifiedStorageItem } from '@/services/unified-data-service';

const componentTypes = [
  { id: 'cpu', name: 'Processadores', icon: Cpu },
  { id: 'memory', name: 'Memória', icon: MemoryStick },
  { id: 'storage', name: 'Armazenamento', icon: HardDrive },
  { id: 'os', name: 'Sistemas Operacionais', icon: Server },
  { id: 'connectivity', name: 'Conectividade', icon: Globe }
];

// Create a unified type that matches what SystemComponentsTable expects
interface UnifiedSystemComponent {
  id: string;
  component_type: string;
  component_id: string;
  name: string;
  description?: string;
  price: number;
  subtype?: string;
  is_hardware: boolean;
  is_active: boolean;
  specs?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function SystemComponentsManager() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [componentTab, setComponentTab] = useState('cpu');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { 
    loading,
    cpuComponents,
    memoryComponents,
    osComponents,
    connectivityComponents,
    storageItems,
    loadComponentsByType,
    loadAllData
  } = useUnifiedData();

  // Convert storage items to match the expected interface
  const convertStorageToComponents = (items: UnifiedStorageItem[]): UnifiedSystemComponent[] => {
    return items.map(item => ({
      id: item.id,
      component_type: 'storage',
      component_id: `${item.storage_type}_${item.item_type}_${item.capacity_gb || 0}`,
      name: item.name,
      description: item.description,
      price: item.price,
      subtype: `${item.storage_type}_${item.item_type}`,
      is_hardware: true,
      is_active: true,
      specs: Array.isArray(item.specs) ? item.specs as string[] : [],
      metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
  };

  // Get current components based on selected tab
  const getCurrentComponents = (): UnifiedSystemComponent[] => {
    switch (componentTab) {
      case 'cpu': return cpuComponents as UnifiedSystemComponent[];
      case 'memory': return memoryComponents as UnifiedSystemComponent[];
      case 'os': return osComponents as UnifiedSystemComponent[];
      case 'connectivity': return connectivityComponents as UnifiedSystemComponent[];
      case 'storage': return convertStorageToComponents(storageItems);
      default: return [];
    }
  };

  const handleCreateComponent = () => {
    setIsCreateDialogOpen(true);
  };

  const handleComponentCreated = () => {
    loadComponentsByType(componentTab);
    setIsCreateDialogOpen(false);
  };

  const handleRefetch = () => {
    if (componentTab === 'storage') {
      loadAllData();
    } else {
      loadComponentsByType(componentTab);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Gestão do Sistema
          </h2>
          <p className="text-muted-foreground">
            Sistema unificado de gestão de dados e preparação para produção
          </p>
        </div>
        {activeTab === 'components' && (
          <Button onClick={handleCreateComponent} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Componente
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="gap-2">
            <Settings className="h-4 w-4" />
            Dashboard de Produção
          </TabsTrigger>
          <TabsTrigger value="migration" className="gap-2">
            <Database className="h-4 w-4" />
            Consolidação de Dados
          </TabsTrigger>
          <TabsTrigger value="components" className="gap-2">
            <Server className="h-4 w-4" />
            Componentes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ProductionDashboard />
        </TabsContent>

        <TabsContent value="migration">
          <MigrationButton />
          
          <Card>
            <CardHeader>
              <CardTitle>Sobre a Consolidação de Dados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Dados consolidados:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Processadores (CPUs/GPUs)</li>
                    <li>• Memória RAM</li>
                    <li>• Sistemas Operacionais</li>
                    <li>• Conectividade e Rede</li>
                    <li>• Armazenamento (Interno/Externo)</li>
                    <li>• Data Centers</li>
                    <li>• Tipos de Contrato</li>
                  </ul>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Benefícios da Consolidação:</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Fonte única de verdade</li>
                    <li>• Eliminação de dados estáticos</li>
                    <li>• Gestão centralizada</li>
                    <li>• Performance otimizada</li>
                    <li>• Escalabilidade garantida</li>
                    <li>• Preparação para APIs</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="components">
          <Tabs value={componentTab} onValueChange={setComponentTab}>
            <TabsList className="grid grid-cols-5 w-full">
              {componentTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <TabsTrigger key={type.id} value={type.id} className="gap-2">
                    <Icon className="h-4 w-4" />
                    {type.name}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            {componentTypes.map((type) => (
              <TabsContent key={type.id} value={type.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <type.icon className="h-5 w-5" />
                      {type.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SystemComponentsTable
                      components={getCurrentComponents()}
                      loading={loading}
                      onRefetch={handleRefetch}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>
      </Tabs>

      <CreateComponentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onComponentCreated={handleComponentCreated}
        componentType={componentTab}
      />
    </div>
  );
}
