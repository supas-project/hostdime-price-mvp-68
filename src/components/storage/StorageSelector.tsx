
import React, { useState, useEffect } from 'react';
import { useStorageTypes, StorageType } from './hooks/useStorageTypes';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { PricedDiskOption } from '@/types/storage';
import { InternalStoragePanel } from './InternalStoragePanel';
import { ExternalStoragePanel } from './ExternalStoragePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageHeader } from './storage-header';
import { HardDrive, RefreshCw } from 'lucide-react';
import { PriceService } from '@/services/price-service';
import { toast } from 'sonner';

export interface StorageSelectorProps {
  onSelectInternalDisk: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const storageTypes = useStorageTypes();
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  
  // Create a mapping for the storage performance indicators
  const storagePerformanceMap: Record<string, {
    name: string;
    pricePerGB: number;
    iops: string;
    throughput: string;
    description: string;
  }> = {};
  
  // Populate the performance map from storage types
  storageTypes.forEach(storage => {
    // Extract IOPS from specs
    const iopsSpec = storage.specs.find(spec => spec.toLowerCase().includes('iops'));
    const iops = iopsSpec ? iopsSpec.split(':')[1]?.trim() : 'N/A';
    
    // Extract throughput from specs
    const throughputSpec = storage.specs.find(spec => spec.toLowerCase().includes('throughput'));
    const throughput = throughputSpec ? throughputSpec.split(':')[1]?.trim() : 'N/A';
    
    storagePerformanceMap[storage.id] = {
      name: storage.name,
      pricePerGB: storage.pricePerGB,
      iops,
      throughput,
      description: storage.description
    };
  });

  // Function to force synchronization with the latest data
  const handleSynchronizeData = async () => {
    setIsSynchronizing(true);
    
    try {
      // Force refresh data from the source
      await PriceService.forceRefreshFromLatestSource();
      
      // Notify using custom event for components to update
      const event = new CustomEvent('storage-data-updated');
      window.dispatchEvent(event);
      
      toast.success("Dados sincronizados", {
        description: "As opções de armazenamento foram atualizadas com sucesso."
      });
    } catch (error) {
      console.error("Error synchronizing storage data:", error);
      toast.error("Erro na sincronização", {
        description: "Não foi possível sincronizar os dados de armazenamento."
      });
    } finally {
      setIsSynchronizing(false);
    }
  };

  // Listen for storage data updates
  useEffect(() => {
    const handleStorageDataUpdated = () => {
      // This will be handled by child components listening to the same event
      console.log("Storage data updated event received in StorageSelector");
    };
    
    window.addEventListener('storage-data-updated', handleStorageDataUpdated);
    
    return () => {
      window.removeEventListener('storage-data-updated', handleStorageDataUpdated);
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <StorageHeader 
          icon={HardDrive}
          title="Opções de Armazenamento"
          tooltip="Escolha entre discos internos ou storage externo para o seu servidor"
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSynchronizeData}
          disabled={isSynchronizing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSynchronizing ? 'animate-spin' : ''}`} />
          {isSynchronizing ? 'Sincronizando...' : 'Sincronizar Dados'}
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'internal' | 'external')}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="internal">Discos Internos</TabsTrigger>
          <TabsTrigger value="external">Storage Externo</TabsTrigger>
        </TabsList>
        
        <TabsContent value="internal" className="mt-4">
          <InternalStoragePanel onSelectDisk={onSelectInternalDisk} />
        </TabsContent>
        
        <TabsContent value="external" className="mt-4">
          <ExternalStoragePanel 
            onSelectStorage={onSelectExternalStorage}
            storageTypes={storagePerformanceMap}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
