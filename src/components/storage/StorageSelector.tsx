
import React, { useState, useEffect } from 'react';
import { useStorageTypes, StorageType } from './hooks/useStorageTypes';
import { Button } from '../ui/button';
import { Card } from '../ui/card';

interface StorageSelectorProps {
  onSelect: (storage: StorageType) => void;
  selectedStorageId?: string | null;
}

export function StorageSelector({ onSelect, selectedStorageId }: StorageSelectorProps) {
  const storageTypes = useStorageTypes();
  const [selectedId, setSelectedId] = useState<string | null>(selectedStorageId || null);
  
  // Select first storage type if none is selected
  useEffect(() => {
    if (storageTypes.length > 0 && !selectedId) {
      setSelectedId(storageTypes[0].id);
      onSelect(storageTypes[0]);
    }
  }, [storageTypes, selectedId, onSelect]);
  
  // Update if selectedStorageId changes externally
  useEffect(() => {
    if (selectedStorageId !== selectedId) {
      setSelectedId(selectedStorageId || null);
    }
  }, [selectedStorageId]);
  
  const handleSelect = (storage: StorageType) => {
    setSelectedId(storage.id);
    onSelect(storage);
  };
  
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
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Select Storage Type</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {storageTypes.map(storage => (
          <Card 
            key={storage.id}
            className={`p-4 cursor-pointer transition-all ${
              selectedId === storage.id 
              ? 'ring-2 ring-primary border-primary bg-primary/5' 
              : 'hover:bg-muted/50'
            }`}
            onClick={() => handleSelect(storage)}
          >
            <div className="flex flex-col h-full">
              <h4 className="font-medium text-lg">{storage.name}</h4>
              
              <div className="text-sm text-muted-foreground mb-2">
                {storage.description}
              </div>
              
              <div className="mt-auto space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>IOPS:</span>
                  <span className="font-medium">
                    {storagePerformanceMap[storage.id]?.iops || 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Throughput:</span>
                  <span className="font-medium">
                    {storagePerformanceMap[storage.id]?.throughput || 'N/A'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span>Price:</span>
                  <span className="font-medium">
                    ${storage.pricePerGB.toFixed(2)}/GB/mo
                  </span>
                </div>
              </div>
              
              {selectedId === storage.id && (
                <Button size="sm" className="w-full mt-3 bg-primary text-primary-foreground">
                  Selected
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
