
import React, { useState, useEffect } from 'react';
import { useStorageTypes, StorageType } from './hooks/useStorageTypes';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { PricedDiskOption } from '@/types/storage';
import { InternalStoragePanel } from './InternalStoragePanel';
import { ExternalStoragePanel } from './ExternalStoragePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageHeader } from './storage-header';
import { HardDrive } from 'lucide-react';
import { StorageService } from '@/services/storage-service-refactored';

export interface StorageSelectorProps {
  onSelectInternalDisk: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage: (type: string, capacity: number, price: number) => void;
}

export function StorageSelector({ onSelectInternalDisk, onSelectExternalStorage }: StorageSelectorProps) {
  const storageTypes = useStorageTypes();
  const [activeTab, setActiveTab] = useState<'internal' | 'external'>('internal');
  const [externalStorageTypes, setExternalStorageTypes] = useState<{
    [key: string]: {
      name: string;
      pricePerGB: number;
      iops: string;
      throughput: string;
      description: string;
    }
  }>({});
  
  // Load external storage from unified data service
  useEffect(() => {
    const loadExternalStorageFromUnifiedService = async () => {
      try {
        console.log('[StorageSelector] Loading external storage from unified service...');
        
        const externalStorageData = await StorageService.getExternalStorageTypes();
        
        if (Object.keys(externalStorageData).length > 0) {
          console.log(`[StorageSelector] Found ${Object.keys(externalStorageData).length} external storage types from unified service`);
          setExternalStorageTypes(externalStorageData);
          console.log('[StorageSelector] External storage loaded from unified service:', externalStorageData);
        } else {
          console.log('[StorageSelector] No external storage items found in unified service');
          setExternalStorageTypes({});
        }
      } catch (error) {
        console.error('[StorageSelector] Error loading external storage from unified service:', error);
        setExternalStorageTypes({});
      }
    };

    loadExternalStorageFromUnifiedService();
  }, []);
  
  // Log dos tipos de armazenamento que foram carregados
  useEffect(() => {
    console.log('[StorageSelector] Loaded storage types:', storageTypes.length);
    if (storageTypes.length > 0) {
      console.log('[StorageSelector] First storage type:', storageTypes[0]);
    }
  }, [storageTypes]);
  
  // Log dos tipos externos carregados
  useEffect(() => {
    console.log('[StorageSelector] External storage types loaded:', Object.keys(externalStorageTypes).length);
    Object.entries(externalStorageTypes).forEach(([key, type]) => {
      console.log(`[StorageSelector] External type ${key}: ${type.name} = ${type.pricePerGB}/GB`);
    });
  }, [externalStorageTypes]);

  return (
    <div className="space-y-8">
      <StorageHeader 
        icon={HardDrive}
        title="Opções de Armazenamento"
        tooltip="Escolha entre discos internos ou storage externo para o seu servidor"
      />
      
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
            storageTypes={externalStorageTypes}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
