
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorageTypes } from './hooks/useStorageTypes';
import { InternalStoragePanel } from './InternalStoragePanel';
import { ExternalStoragePanel } from './ExternalStoragePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageHeader } from './storage-header';
import { HardDrive } from 'lucide-react';
import { StorageService } from '@/services/storage-service-refactored';
import { PricedDiskOption } from '@/types/storage';

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
  const [isLoading, setIsLoading] = useState(false);
  
  // Memoize the external storage loading function to prevent recreation
  const loadExternalStorage = useCallback(async () => {
    if (isLoading) return; // Prevent multiple simultaneous calls
    
    setIsLoading(true);
    try {
      console.log('[StorageSelector] Loading external storage from unified service...');
      
      const externalStorageData = await StorageService.getExternalStorageTypes();
      
      if (Object.keys(externalStorageData).length > 0) {
        console.log(`[StorageSelector] Found ${Object.keys(externalStorageData).length} external storage types`);
        setExternalStorageTypes(externalStorageData);
      } else {
        console.log('[StorageSelector] No external storage items found');
        setExternalStorageTypes({});
      }
    } catch (error) {
      console.error('[StorageSelector] Error loading external storage:', error);
      setExternalStorageTypes({});
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);
  
  // Load external storage only once on mount
  useEffect(() => {
    loadExternalStorage();
  }, []); // Empty dependency array - only run on mount
  
  // Memoize storage types count to prevent unnecessary re-renders
  const storageTypesCount = useMemo(() => storageTypes.length, [storageTypes]);
  const externalTypesCount = useMemo(() => Object.keys(externalStorageTypes).length, [externalStorageTypes]);
  
  // Log only when counts actually change
  useEffect(() => {
    if (storageTypesCount > 0) {
      console.log(`[StorageSelector] Loaded ${storageTypesCount} internal storage types`);
    }
  }, [storageTypesCount]);
  
  useEffect(() => {
    if (externalTypesCount > 0) {
      console.log(`[StorageSelector] Loaded ${externalTypesCount} external storage types`);
    }
  }, [externalTypesCount]);

  return (
    <div className="space-y-8">
      <StorageHeader 
        icon={HardDrive}
        title="Opções de Armazenamento"
        tooltip="Escolha entre discos internos ou storage externo para o seu servidor"
      />
      
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'internal' | 'external')}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="internal">
            Discos Internos ({storageTypesCount})
          </TabsTrigger>
          <TabsTrigger value="external">
            Storage Externo ({externalTypesCount})
          </TabsTrigger>
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
