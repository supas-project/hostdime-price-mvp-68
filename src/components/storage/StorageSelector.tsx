
import React, { useState, useEffect } from 'react';
import { useStorageTypes, StorageType } from './hooks/useStorageTypes';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { PricedDiskOption } from '@/types/storage';
import { InternalStoragePanel } from './InternalStoragePanel';
import { ExternalStoragePanel } from './ExternalStoragePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageHeader } from './storage-header';

export interface StorageSelectorProps {
  onSelectInternalDisk: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const storageTypes = useStorageTypes();
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  
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

  return (
    <div className="space-y-8">
      <StorageHeader />
      
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
