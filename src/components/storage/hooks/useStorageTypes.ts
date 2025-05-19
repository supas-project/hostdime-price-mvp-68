
import { useState, useEffect } from 'react';
import { PriceService } from '@/services/price-service';
import { storageComponents } from '@/data/storage-components';

export interface StorageType {
  id: string;
  name: string;
  type: string;
  description: string;
  price: number;
  minCapacity: number;
  maxCapacity: number;
  capacityUnit: string;
  capacityStep: number;
  specs: string[];
  benefits: string[];
}

export function useStorageTypes() {
  const [types, setTypes] = useState<StorageType[]>([]);

  useEffect(() => {
    const loadStorageTypes = async () => {
      try {
        // Try to load from price data
        const category = await PriceService.getCategory('storage');
        
        if (category && category.items && category.items.length > 0) {
          // Convert price items to storage types
          const storageTypes: StorageType[] = category.items.map(item => ({
            id: item.id,
            name: item.name,
            type: item.subtype || 'storage',
            description: item.description || '',
            price: item.price,
            minCapacity: item.metadata?.minCapacity || 100,
            maxCapacity: item.metadata?.maxCapacity || 10000,
            capacityUnit: item.metadata?.capacityUnit || 'GB',
            capacityStep: item.metadata?.capacityStep || 100,
            specs: item.specs || [],
            benefits: item.metadata?.benefits || []
          }));
          
          setTypes(storageTypes);
        } else {
          // Fallback to static data
          setTypes(storageComponents);
        }
      } catch (error) {
        console.error('Error loading storage types:', error);
        // Fallback to static data
        setTypes(storageComponents);
      }
    };

    loadStorageTypes();
  }, []);

  return types;
}
