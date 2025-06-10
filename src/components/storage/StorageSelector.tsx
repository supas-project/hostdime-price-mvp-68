
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
import { PriceService } from '@/services/price-service';

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
  
  // CORREÇÃO: Carregar dados REAIS da tabela de preços para storage externo
  useEffect(() => {
    const loadExternalStorageFromPriceTable = async () => {
      try {
        console.log('[StorageSelector] Loading external storage from price table...');
        
        // Tentar carregar da categoria "external_storage" primeiro
        let externalStorageItems = await PriceService.getCategoryItems('external_storage');
        
        // Se não encontrar, tentar categoria "storage"
        if (!externalStorageItems || externalStorageItems.length === 0) {
          console.log('[StorageSelector] No items in external_storage, trying storage category...');
          const allStorageItems = await PriceService.getCategoryItems('storage');
          // Filtrar apenas itens que são claramente de storage externo
          externalStorageItems = allStorageItems?.filter(item => 
            item.name.toLowerCase().includes('block') || 
            item.name.toLowerCase().includes('storage')
          ) || [];
        }
        
        if (externalStorageItems && externalStorageItems.length > 0) {
          console.log(`[StorageSelector] Found ${externalStorageItems.length} external storage items from price table`);
          
          const storageMap: { [key: string]: any } = {};
          
          externalStorageItems.forEach((item, index) => {
            // Extrair IOPS das specs
            const iopsSpec = item.specs?.find(spec => spec.toLowerCase().includes('iops'));
            const iops = iopsSpec ? iopsSpec : 'N/A IOPS';
            
            // Extrair throughput das specs  
            const throughputSpec = item.specs?.find(spec => spec.toLowerCase().includes('throughput') || spec.toLowerCase().includes('mb/s'));
            const throughput = throughputSpec ? throughputSpec : 'N/A MB/s';
            
            // Usar o preço REAL da tabela
            const pricePerGB = typeof item.price === 'number' ? item.price : 0;
            
            console.log(`[StorageSelector] REAL PRICE - Item: ${item.name}, Price per GB from table: ${pricePerGB}`);
            
            storageMap[item.id] = {
              name: item.name,
              pricePerGB: pricePerGB, // VALOR REAL DA TABELA
              iops: iops,
              throughput: throughput,
              description: item.description || 'Storage externo de alta performance'
            };
          });
          
          setExternalStorageTypes(storageMap);
          console.log('[StorageSelector] REAL PRICES loaded from price table:', storageMap);
        } else {
          console.log('[StorageSelector] No external storage items found in price table');
          setExternalStorageTypes({});
        }
      } catch (error) {
        console.error('[StorageSelector] Error loading external storage from price table:', error);
        setExternalStorageTypes({});
      }
    };

    loadExternalStorageFromPriceTable();
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
      console.log(`[StorageSelector] REAL PRICE - External type ${key}: ${type.name} = ${type.pricePerGB}/GB`);
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
