
import { PriceService } from './price-service';
import { UnifiedDataService } from './unified-data-service';
import { toast } from '@/utils/toast-utils';

/**
 * Unified Data Synchronization Service
 * Ensures data consistency between UnifiedDataService and PriceService
 */
export class DataSynchronizationService {
  
  /**
   * Synchronize all data between unified source and price table
   */
  static async synchronizeAllData(): Promise<boolean> {
    try {
      console.log('[DataSync] Starting unified data synchronization...');
      
      // Get all data from unified service
      const [categories, items] = await Promise.all([
        UnifiedDataService.getCategories(),
        UnifiedDataService.getItems()
      ]);
      
      console.log('[DataSync] Loaded unified data:', {
        categories: categories.length,
        items: items.length
      });
      
      // Build unified price data structure with compatible metadata
      const unifiedPriceData: Record<string, any> = {};
      
      // Group items by category
      categories.forEach(category => {
        const categoryItems = items.filter(item => item.category_id === category.id);
        
        unifiedPriceData[category.name.toLowerCase().replace(/\s+/g, '')] = {
          id: category.id,
          name: category.name,
          items: categoryItems.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            type: category.name.toLowerCase().replace(/\s+/g, ''),
            specs: Array.isArray(item.specs) ? item.specs : [],
            metadata: {
              features: Array.isArray(item.specs) ? item.specs : [],
              categoryId: category.id,
              tags: item.tags || []
            }
          }))
        };
      });
      
      // Save to price service
      await PriceService.saveData(unifiedPriceData);
      
      console.log('[DataSync] Successfully synchronized unified data to price table');
      toast.success('Sincronização concluída', {
        description: 'Dados unificados sincronizados com a tabela de preços'
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
   * Check for data consistency between unified source and price table
   */
  static async checkDataConsistency(): Promise<{
    missingInPrice: string[];
    extraInPrice: string[];
    itemMismatches: Record<string, { missing: number; extra: number }>;
  }> {
    try {
      // Get data from both sources
      const [priceData, categories, items] = await Promise.all([
        PriceService.getAllData(),
        UnifiedDataService.getCategories(),
        UnifiedDataService.getItems()
      ]);
      
      const unifiedCategories = categories.map(cat => cat.name.toLowerCase().replace(/\s+/g, ''));
      const priceCategories = Object.keys(priceData);
      
      const missingInPrice = unifiedCategories.filter(cat => !priceCategories.includes(cat));
      const extraInPrice = priceCategories.filter(cat => !unifiedCategories.includes(cat));
      
      const itemMismatches: Record<string, { missing: number; extra: number }> = {};
      
      // Check item counts per category
      categories.forEach(category => {
        const categoryKey = category.name.toLowerCase().replace(/\s+/g, '');
        const unifiedItems = items.filter(item => item.category_id === category.id);
        const priceItems = priceData[categoryKey]?.items || [];
        
        const unifiedCount = unifiedItems.length;
        const priceCount = priceItems.length;
        
        if (unifiedCount !== priceCount) {
          itemMismatches[category.name] = {
            missing: Math.max(0, unifiedCount - priceCount),
            extra: Math.max(0, priceCount - unifiedCount)
          };
        }
      });
      
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
