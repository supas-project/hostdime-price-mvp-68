
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useStorageTypes } from './hooks/useStorageTypes';
import { ExternalStoragePanel } from './ExternalStoragePanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StorageHeader } from './storage-header';
import { HardDrive } from 'lucide-react';
import { PricedDiskOption } from '@/types/storage';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

export interface StorageSelectorProps {
  onSelectInternalDisk: (disk: PricedDiskOption, quantity: number) => void;
  onSelectExternalStorage: (type: string, capacity: number, price: number) => void;
}

// Static internal disk data
const staticInternalDisks: PricedDiskOption[] = [
  {
    id: 'ssd-480gb',
    type: 'ssd',
    capacity: '480 GB',
    price: 150,
    specs: {
      readSpeed: '550 MB/s',
      writeSpeed: '520 MB/s',
      iops: '95,000',
      recommended: ['Web servers', 'Databases']
    }
  },
  {
    id: 'ssd-960gb',
    type: 'ssd',
    capacity: '960 GB',
    price: 280,
    specs: {
      readSpeed: '550 MB/s',
      writeSpeed: '520 MB/s',
      iops: '95,000',
      recommended: ['Web servers', 'Databases']
    }
  },
  {
    id: 'nvme-1tb',
    type: 'nvme',
    capacity: '1 TB',
    price: 350,
    specs: {
      readSpeed: '3,500 MB/s',
      writeSpeed: '3,000 MB/s',
      iops: '500,000',
      recommended: ['High performance apps', 'Gaming servers']
    }
  }
];

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
  }>({
    'block-storage': {
      name: 'Block Storage',
      pricePerGB: 0.15,
      iops: '3,000',
      throughput: '125 MB/s',
      description: 'Storage de alta performance para aplicações críticas'
    },
    'object-storage': {
      name: 'Object Storage',
      pricePerGB: 0.08,
      iops: '1,000',
      throughput: '50 MB/s',
      description: 'Storage econômico para backups e arquivos'
    }
  });

  const handleSelectInternalDisk = (disk: PricedDiskOption) => {
    onSelectInternalDisk(disk, 1);
  };

  const storageTypesCount = useMemo(() => staticInternalDisks.length, []);
  const externalTypesCount = useMemo(() => Object.keys(externalStorageTypes).length, [externalStorageTypes]);

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {staticInternalDisks.map((disk) => (
              <Card key={disk.id} className="relative">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{disk.type.toUpperCase()}</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(disk.price)}
                    </span>
                  </CardTitle>
                  <CardDescription>{disk.capacity}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Leitura:</span>
                      <span>{disk.specs.readSpeed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Escrita:</span>
                      <span>{disk.specs.writeSpeed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>IOPS:</span>
                      <span>{disk.specs.iops}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Recomendado para:</p>
                    <div className="flex flex-wrap gap-1">
                      {disk.specs.recommended.map((rec, index) => (
                        <span key={index} className="text-xs bg-secondary px-2 py-1 rounded">
                          {rec}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleSelectInternalDisk(disk)}
                    className="w-full"
                  >
                    Selecionar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
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
