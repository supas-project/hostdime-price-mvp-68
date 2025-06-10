
import { PriceItem } from '@/types/pricing';
import { StorageType } from '../types/storage-types';
import { parseUnitInfo, extractSpecs } from './metadata-parser';

/**
 * Maps a price item to a storage type
 * @param item The price item from the price service
 * @returns A storage type object
 */
export function mapPriceItemToStorageType(item: PriceItem): StorageType {
  // Extract metadata from the item
  const metadata = item.metadata || {};
  
  // Get additional info from unitInfo
  const unitInfo = parseUnitInfo(metadata);
  
  return {
    id: item.id,
    name: item.name,
    description: item.description || '',
    price: item.price || 0,
    pricePerGB: item.price / 100, // Assuming price is per 100GB
    type: item.type || 'storage',
    subtype: item.subtype || 'block',
    specs: extractSpecs(item),
    minCapacity: unitInfo.minCapacity,
    maxCapacity: unitInfo.maxCapacity,
    capacityUnit: unitInfo.capacityUnit,
    capacityStep: unitInfo.capacityStep,
    benefits: unitInfo.benefits
  };
}

/**
 * Maps static storage data to storage types
 * @param item The static storage data item
 * @returns A storage type object
 */
export function mapStaticDataToStorageType(item: any): StorageType {
  return {
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
  };
}
