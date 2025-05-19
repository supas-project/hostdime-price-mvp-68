
import { useState, useEffect } from 'react';
import { ComponentOption } from '@/types/component';
import { PriceService } from "@/services/price-service";
import { PriceItem } from '@/types/pricing';
import { storageData } from '@/data/storage-pricing';

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
        // Try to get storage category from price service
        try {
          const category = await PriceService.getCategory('storage');
          if (category && Array.isArray(category.items) && category.items.length > 0) {
            // Convert price items to storage types
            const types: StorageType[] = category.items.map(item => {
              // Access metadata carefully with optional chaining and defaults
              const metadata = item.metadata || {};
              
              // Extract metadata from features or unitInfo if available
              let additionalInfo: any = {};
              try {
                if (metadata.unitInfo) {
                  additionalInfo = JSON.parse(metadata.unitInfo as string);
                }
              } catch (e) {
                console.error('Error parsing unitInfo', e);
              }
              
              return {
                id: item.id,
                name: item.name,
                description: item.description || '',
                price: item.price || 0,
                pricePerGB: item.price / 100, // Assuming price is per 100GB
                type: item.type || 'storage',
                subtype: item.subtype || 'block',
                specs: item.specs || [],
                // Use parsed unitInfo or fallback to defaults
                minCapacity: additionalInfo.minCapacity || 100,
                maxCapacity: additionalInfo.maxCapacity || 1000,
                capacityUnit: additionalInfo.capacityUnit || 'GB',
                capacityStep: additionalInfo.capacityStep || 100,
                benefits: additionalInfo.benefits || metadata.features || []
              };
            });

            setStorageTypes(types);
            return;
          }
        } catch (error) {
          console.error('Error loading storage types from price service:', error);
        }
        
        // Fallback to static data
        console.log('Falling back to static storage data');
        const staticTypes: StorageType[] = storageData.map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          pricePerGB: item.price,
          type: item.type,
          subtype: item.subtype,
          specs: item.specs || [],
          minCapacity: item.metadata.minCapacity,
          maxCapacity: item.metadata.maxCapacity,
          capacityUnit: item.metadata.capacityUnit,
          capacityStep: item.metadata.capacityStep,
          benefits: item.metadata.benefits
        }));
        
        setStorageTypes(staticTypes);
      } catch (error) {
        console.error('Error loading storage types:', error);
        setStorageTypes([]);
      }
    };

    loadStorageTypes();
  }, []);

  return storageTypes;
}
