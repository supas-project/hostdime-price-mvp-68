
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { PriceService } from "@/services/price-service";

export interface StorageType {
  id: string;
  name: string;
  description: string;
  price: number;
  pricePerGB: number;
  type: string;
  subtype: string;
  specs: string[];
  minCapacity: number;
  maxCapacity: number;
  capacityUnit: string;
  capacityStep: number;
  benefits: string[];
}

export function useStorageTypes() {
  const [storageTypes, setStorageTypes] = useState<StorageType[]>([]);

  useEffect(() => {
    const loadStorageTypes = async () => {
      try {
        const category = await PriceService.getCategory('storage');
        if (category && Array.isArray(category.items) && category.items.length > 0) {
          // Convert price items to storage types
          const types: StorageType[] = category.items.map(item => {
            // Access metadata carefully with optional chaining and defaults
            const metadata = item.metadata || {};
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              pricePerGB: item.price / 100, // Assuming price is per 100GB
              type: item.type,
              subtype: item.subtype,
              specs: item.specs || [],
              // Use safe defaults if metadata properties don't exist
              minCapacity: 100,  // Default values
              maxCapacity: 1000,
              capacityUnit: 'GB',
              capacityStep: 100,
              benefits: Array.isArray(metadata.features) ? metadata.features : []
            };
          });

          setStorageTypes(types);
        } else {
          console.warn('No storage types found');
          setStorageTypes([]);
        }
      } catch (error) {
        console.error('Error loading storage types:', error);
        setStorageTypes([]);
      }
    };

    loadStorageTypes();
  }, []);

  return storageTypes;
}
