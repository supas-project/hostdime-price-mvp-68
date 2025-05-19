
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

// Define expected metadata structure
interface StorageMetadata {
  minCapacity?: number;
  maxCapacity?: number;
  capacityUnit?: string;
  capacityStep?: number;
  benefits?: string[];
  discount?: number;
  features?: string[];
  quantity?: number;
  unitPrice?: number;
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
          const storageTypes: StorageType[] = category.items.map(item => {
            const metadata = item.metadata as StorageMetadata || {};
            
            return {
              id: item.id,
              name: item.name,
              type: item.subtype || 'storage',
              description: item.description || '',
              price: item.price,
              minCapacity: metadata.minCapacity || 100,
              maxCapacity: metadata.maxCapacity || 10000,
              capacityUnit: metadata.capacityUnit || 'GB',
              capacityStep: metadata.capacityStep || 100,
              specs: item.specs || [],
              benefits: metadata.benefits || []
            };
          });
          
          setTypes(storageTypes);
        } else {
          // Fallback to static data - need to convert to correct format
          const componentOptions = storageComponents.options || [];
          const formattedTypes = componentOptions.map(option => ({
            id: option.id,
            name: option.name,
            type: option.subtype || 'storage',
            description: option.description || '',
            price: option.price,
            minCapacity: 100,
            maxCapacity: 10000,
            capacityUnit: 'GB',
            capacityStep: 100,
            specs: option.specs || [],
            benefits: []
          }));
          setTypes(formattedTypes);
        }
      } catch (error) {
        console.error('Error loading storage types:', error);
        // Fallback to static data with proper formatting
        const componentOptions = storageComponents.options || [];
        const formattedTypes = componentOptions.map(option => ({
          id: option.id,
          name: option.name,
          type: option.subtype || 'storage',
          description: option.description || '',
          price: option.price,
          minCapacity: 100,
          maxCapacity: 10000,
          capacityUnit: 'GB',
          capacityStep: 100,
          specs: option.specs || [],
          benefits: []
        }));
        setTypes(formattedTypes);
      }
    };

    loadStorageTypes();
  }, []);

  return types;
}
