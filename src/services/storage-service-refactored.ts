
import { UnifiedDataService } from './unified-data-service';
import { PricedDiskOption } from '@/types/storage';

/**
 * Refactored Storage Service using UnifiedDataService
 * Replaces storage-related logic from other services
 */
export class StorageService {
  
  /**
   * Get internal storage options (disks)
   */
  static async getInternalStorageOptions(): Promise<PricedDiskOption[]> {
    try {
      const storageItems = await UnifiedDataService.getAllStorageItems();
      const internalItems = storageItems.filter(item => item.storage_type === 'internal');
      
      return internalItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        capacity: item.capacity_gb || 0,
        type: item.item_type as 'ssd' | 'hdd' | 'nvme',
        specs: Array.isArray(item.specs) ? item.specs : [],
        description: item.description || '',
        metadata: item.metadata || {}
      }));
    } catch (error) {
      console.error('[StorageService] Error loading internal storage:', error);
      throw error;
    }
  }

  /**
   * Get external storage types
   */
  static async getExternalStorageTypes(): Promise<Record<string, any>> {
    try {
      const storageItems = await UnifiedDataService.getAllStorageItems();
      const externalItems = storageItems.filter(item => item.storage_type === 'external');
      
      const storageTypes: Record<string, any> = {};
      
      externalItems.forEach(item => {
        storageTypes[item.id] = {
          name: item.name,
          pricePerGB: item.price,
          iops: item.specs?.find((spec: string) => spec.toLowerCase().includes('iops')) || 'N/A IOPS',
          throughput: item.specs?.find((spec: string) => spec.toLowerCase().includes('throughput')) || 'N/A MB/s',
          description: item.description || 'Storage externo de alta performance'
        };
      });
      
      return storageTypes;
    } catch (error) {
      console.error('[StorageService] Error loading external storage:', error);
      throw error;
    }
  }

  /**
   * Get storage item by ID
   */
  static async getStorageItemById(id: string) {
    try {
      const storageItems = await UnifiedDataService.getAllStorageItems();
      return storageItems.find(item => item.id === id);
    } catch (error) {
      console.error('[StorageService] Error loading storage item:', error);
      throw error;
    }
  }

  /**
   * Get storage options by type
   */
  static async getStorageByType(storageType: 'internal' | 'external') {
    try {
      const storageItems = await UnifiedDataService.getAllStorageItems();
      return storageItems.filter(item => item.storage_type === storageType);
    } catch (error) {
      console.error(`[StorageService] Error loading ${storageType} storage:`, error);
      throw error;
    }
  }
}
