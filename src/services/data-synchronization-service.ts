
import { PriceService } from './price-service';
import { ComponentService } from './component-service-refactored';
import { toast } from '@/utils/toast-utils';

/**
 * Unified Data Synchronization Service
 * Ensures data consistency between ComponentService (unified data) and PriceService
 */
export class DataSynchronizationService {
  
  /**
   * Synchronize all data between unified source and price table
   */
  static async synchronizeAllData(): Promise<boolean> {
    try {
      console.log('[DataSync] Starting unified data synchronization...');
      
      // Ensure data is consolidated first
      await ComponentService.ensureDataConsolidation();
      
      // Get standardized data from unified source
      const unifiedCategories = await ComponentService.getAllComponentsByCategory();
      
      // Get current price data
      const priceData = await PriceService.getAllData();
      const priceCategories = Object.keys(priceData);
      
      console.log('[DataSync] Unified categories:', Object.keys(unifiedCategories));
      console.log('[DataSync] Price categories:', priceCategories);
      
      // Use standard category mapping
      const standardCategories = ['cpu', 'memory', 'os', 'connectivity', 'storage', 'datacenter', 'contract'];
      
      // Synchronize each standard category
      for (const categoryId of standardCategories) {
        const unifiedItems = unifiedCategories[categoryId] || [];
        
        if (unifiedItems.length > 0) {
          await this.syncCategory(categoryId, unifiedItems);
        }
      }
      
      toast.success('Sincronização unificada concluída', {
        description: `${standardCategories.length} categorias sincronizadas com dados unificados`
      });
      
      return true;
    } catch (error) {
      console.error('[DataSync] Error during unified synchronization:', error);
      toast.error('Erro na sincronização unificada', {
        description: 'Falha ao sincronizar dados unificados com tabela de preços'
      });
      return false;
    }
  }
  
  /**
   * Sync a category with unified data
   */
  private static async syncCategory(categoryId: string, unifiedItems: any[]): Promise<void> {
    try {
      console.log(`[DataSync] Syncing category ${categoryId} with ${unifiedItems.length} items`);
      
      // Check if category exists in price table
      const existingCategory = await PriceService.getCategory(categoryId);
      
      if (!existingCategory) {
        // Create category
        const categoryData = {
          id: categoryId,
          name: this.getCategoryDisplayName(categoryId)
        };
        
        await PriceService.addCategory(categoryData);
        console.log(`[DataSync] Created category ${categoryId}`);
      }
      
      // Sync all items
      for (const item of unifiedItems) {
        const itemData = {
          id: item.id,
          name: item.name,
          description: item.description || '',
          price: item.price || 0,
          type: categoryId,
          specs: Array.isArray(item.specs) ? item.specs : [],
          metadata: item.metadata || {}
        };
        
        // Check if item exists
        const existingItem = await PriceService.getItem(categoryId, item.id);
        
        if (existingItem) {
          // Update existing item
          await PriceService.updateItem(categoryId, item.id, itemData);
        } else {
          // Add new item
          await PriceService.addItem(categoryId, itemData);
        }
      }
      
      console.log(`[DataSync] Successfully synced category ${categoryId}`);
    } catch (error) {
      console.error(`[DataSync] Error syncing category ${categoryId}:`, error);
    }
  }
  
  /**
   * Get standardized display name for category
   */
  private static getCategoryDisplayName(categoryId: string): string {
    const displayNames: Record<string, string> = {
      'cpu': 'Processadores',
      'memory': 'Memória',
      'storage': 'Armazenamento',
      'connectivity': 'Conectividade',
      'os': 'Sistema Operacional',
      'datacenter': 'Data Center',
      'contract': 'Contratos'
    };
    
    return displayNames[categoryId] || categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
  }
  
  /**
   * Check for data consistency between unified source and price table
   */
  static async checkDataConsistency(): Promise<{
    missingInPrice: string[];
    extraInPrice: string[];
    itemMismatches: Record<string, { missing: number; extra: number }>;
  }> {
    try {
      // Get data from both sources
      const [unifiedCategories, priceData] = await Promise.all([
        ComponentService.getAllComponentsByCategory(),
        PriceService.getAllData()
      ]);
      
      const standardCategories = ['cpu', 'memory', 'os', 'connectivity', 'storage', 'datacenter', 'contract'];
      const priceCategories = Object.keys(priceData);
      
      const missingInPrice = standardCategories.filter(cat => !priceCategories.includes(cat));
      const extraInPrice = priceCategories.filter(cat => !standardCategories.includes(cat));
      
      const itemMismatches: Record<string, { missing: number; extra: number }> = {};
      
      // Check item consistency for standard categories
      for (const categoryId of standardCategories) {
        const unifiedItems = unifiedCategories[categoryId] || [];
        const priceItems = priceData[categoryId]?.items || [];
        
        const unifiedItemIds = unifiedItems.map(item => item.id);
        const priceItemIds = priceItems.map(item => item.id);
        
        const missingItems = unifiedItems.filter(item => !priceItemIds.includes(item.id));
        const extraItems = priceItems.filter(item => !unifiedItemIds.includes(item.id));
        
        if (missingItems.length > 0 || extraItems.length > 0) {
          itemMismatches[categoryId] = {
            missing: missingItems.length,
            extra: extraItems.length
          };
        }
      }
      
      return {
        missingInPrice,
        extraInPrice,
        itemMismatches
      };
    } catch (error) {
      console.error('[DataSync] Error checking consistency:', error);
      return {
        missingInPrice: [],
        extraInPrice: [],
        itemMismatches: {}
      };
    }
  }
}
