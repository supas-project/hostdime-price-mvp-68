
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Database, HardDrive, Cpu, MemoryStick, Globe, Server, Smartphone } from 'lucide-react';
import { useSystemComponents } from '@/hooks/useSystemComponents';
import { SystemComponentsTable } from './SystemComponentsTable';
import { CreateComponentDialog } from './CreateComponentDialog';
import { MigrationButton } from './MigrationButton';

const componentTypes = [
  { id: 'cpu', name: 'Processadores', icon: Cpu },
  { id: 'memory', name: 'Memória', icon: MemoryStick },
  { id: 'storage', name: 'Armazenamento', icon: HardDrive },
  { id: 'os', name: 'Sistemas Operacionais', icon: Server },
  { id: 'connectivity', name: 'Conectividade', icon: Globe }
];

export function SystemComponentsManager() {
  const [activeTab, setActiveTab] = useState('cpu');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { components, loading, refetch } = useSystemComponents(activeTab);

  const handleCreateComponent = () => {
    setIsCreateDialogOpen(true);
  };

  const handleComponentCreated = () => {
    refetch();
    setIsCreateDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Componentes do Sistema
          </h2>
          <p className="text-muted-foreground">
            Gerencie os componentes armazenados no banco de dados
          </p>
        </div>
        <Button onClick={handleCreateComponent} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Componente
        </Button>
      </div>

      <MigrationButton />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                  components={components}
                  loading={loading}
                  onRefetch={refetch}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <CreateComponentDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onComponentCreated={handleComponentCreated}
        componentType={activeTab}
      />
    </div>
  );
}
