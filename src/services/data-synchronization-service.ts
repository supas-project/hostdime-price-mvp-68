
import { PriceService } from './price-service';
import { UnifiedDataService } from './unified-data-service';
import { ComponentService } from './component-service-refactored';
import { toast } from '@/utils/toast-utils';

/**
 * Service responsible for synchronizing data between configuration and price table
 */
export class DataSynchronizationService {
  
  /**
   * Synchronize all categories between configuration and price table
   */
  static async synchronizeAllCategories(): Promise<boolean> {
    try {
      console.log('[DataSync] Starting full synchronization...');
      
      // Get current price data
      const priceData = await PriceService.getAllData();
      const priceCategories = Object.keys(priceData);
      
      // Get component categories from unified service
      const componentCategories = await ComponentService.getAllComponentsByCategory();
      const configCategories = Object.keys(componentCategories);
      
      console.log('[DataSync] Price categories:', priceCategories);
      console.log('[DataSync] Config categories:', configCategories);
      
      // Find missing categories in price table
      const missingInPrice = configCategories.filter(cat => !priceCategories.includes(cat));
      const extraInPrice = priceCategories.filter(cat => !configCategories.includes(cat));
      
      console.log('[DataSync] Missing in price table:', missingInPrice);
      console.log('[DataSync] Extra in price table:', extraInPrice);
      
      // Add missing categories to price table
      for (const categoryId of missingInPrice) {
        await this.addCategoryToPriceTable(categoryId, componentCategories[categoryId]);
      }
      
      // Sync items for existing categories
      for (const categoryId of configCategories) {
        if (priceCategories.includes(categoryId)) {
          await this.syncCategoryItems(categoryId, componentCategories[categoryId]);
        }
      }
      
      toast.success('Sincronização concluída', {
        description: `${missingInPrice.length} categorias adicionadas, ${configCategories.length} categorias sincronizadas`
      });
      
      return true;
    } catch (error) {
      console.error('[DataSync] Error during synchronization:', error);
      toast.error('Erro na sincronização', {
        description: 'Falha ao sincronizar dados entre configuração e tabela de preços'
      });
      return false;
    }
  }
  
  /**
   * Add a category to the price table
   */
  private static async addCategoryToPriceTable(categoryId: string, components: any[]): Promise<void> {
    try {
      console.log(`[DataSync] Adding category ${categoryId} to price table`);
      
      const categoryName = this.getCategoryDisplayName(categoryId);
      
      // Convert components to price items
      const items = components.map(component => ({
        id: component.id,
        name: component.name,
        description: component.description || '',
        price: component.price || 0,
        type: categoryId,
        specs: Array.isArray(component.specs) ? component.specs : [],
        metadata: component.metadata || {}
      }));
      
      await PriceService.addCategory({
        id: categoryId,
        name: categoryName,
        items: items
      });
      
      console.log(`[DataSync] Category ${categoryId} added with ${items.length} items`);
    } catch (error) {
      console.error(`[DataSync] Error adding category ${categoryId}:`, error);
    }
  }
  
  /**
   * Sync items between configuration and price table for a specific category
   */
  private static async syncCategoryItems(categoryId: string, configComponents: any[]): Promise<void> {
    try {
      console.log(`[DataSync] Syncing items for category ${categoryId}`);
      
      const priceCategory = await PriceService.getCategory(categoryId);
      if (!priceCategory) return;
      
      const priceItems = priceCategory.items || [];
      const priceItemIds = priceItems.map(item => item.id);
      const configItemIds = configComponents.map(comp => comp.id);
      
      // Find missing items in price table
      const missingItems = configComponents.filter(comp => !priceItemIds.includes(comp.id));
      
      // Add missing items
      for (const component of missingItems) {
        const itemData = {
          name: component.name,
          description: component.description || '',
          price: component.price || 0,
          type: categoryId,
          specs: Array.isArray(component.specs) ? component.specs : [],
          metadata: component.metadata || {}
        };
        
        await PriceService.addItem(categoryId, itemData);
        console.log(`[DataSync] Added item ${component.name} to ${categoryId}`);
      }
      
      // Update existing items with latest data
      for (const component of configComponents) {
        if (priceItemIds.includes(component.id)) {
          const itemData = {
            name: component.name,
            description: component.description || '',
            price: component.price || 0,
            type: categoryId,
            specs: Array.isArray(component.specs) ? component.specs : [],
            metadata: component.metadata || {}
          };
          
          await PriceService.updateItem(categoryId, component.id, itemData);
        }
      }
      
      console.log(`[DataSync] Synced ${configComponents.length} items for ${categoryId}`);
    } catch (error) {
      console.error(`[DataSync] Error syncing items for ${categoryId}:`, error);
    }
  }
  
  /**
   * Get display name for category
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
   * Check for data inconsistencies
   */
  static async checkDataConsistency(): Promise<{
    missingInPrice: string[];
    extraInPrice: string[];
    itemMismatches: Record<string, { missing: number; extra: number }>;
  }> {
    try {
      const priceData = await PriceService.getAllData();
      const componentCategories = await ComponentService.getAllComponentsByCategory();
      
      const priceCategories = Object.keys(priceData);
      const configCategories = Object.keys(componentCategories);
      
      const missingInPrice = configCategories.filter(cat => !priceCategories.includes(cat));
      const extraInPrice = priceCategories.filter(cat => !configCategories.includes(cat));
      
      const itemMismatches: Record<string, { missing: number; extra: number }> = {};
      
      for (const categoryId of configCategories) {
        if (priceCategories.includes(categoryId)) {
          const priceItems = priceData[categoryId]?.items || [];
          const configItems = componentCategories[categoryId] || [];
          
          const priceItemIds = priceItems.map(item => item.id);
          const configItemIds = configItems.map(comp => comp.id);
          
          const missingItems = configItems.filter(comp => !priceItemIds.includes(comp.id));
          const extraItems = priceItems.filter(item => !configItemIds.includes(item.id));
          
          if (missingItems.length > 0 || extraItems.length > 0) {
            itemMismatches[categoryId] = {
              missing: missingItems.length,
              extra: extraItems.length
            };
          }
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
