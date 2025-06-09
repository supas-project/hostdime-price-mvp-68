
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
      
      // First ensure data is consolidated
      const consolidationStatus = await UnifiedDataService.getConsolidationStatus();
      
      if (consolidationStatus.phase !== 'completed') {
        console.log('[DataSync] Data not consolidated, starting consolidation...');
        const consolidated = await UnifiedDataService.consolidateAllData();
        
        if (!consolidated) {
          throw new Error('Failed to consolidate data');
        }
      }
      
      // Get all data from unified service
      const [
        cpuComponents,
        memoryComponents,
        osComponents,
        connectivityComponents,
        storageItems,
        dataCenters,
        contractTypes
      ] = await Promise.all([
        UnifiedDataService.getComponentsByType('cpu'),
        UnifiedDataService.getComponentsByType('memory'),
        UnifiedDataService.getComponentsByType('os'),
        UnifiedDataService.getComponentsByType('connectivity'),
        UnifiedDataService.getAllStorageItems(),
        UnifiedDataService.getAllDataCenters(),
        UnifiedDataService.getAllContractTypes()
      ]);
      
      console.log('[DataSync] Loaded unified data:', {
        cpu: cpuComponents.length,
        memory: memoryComponents.length,
        os: osComponents.length,
        connectivity: connectivityComponents.length,
        storage: storageItems.length,
        datacenters: dataCenters.length,
        contracts: contractTypes.length
      });
      
      // Build unified price data structure
      const unifiedPriceData = {
        cpu: {
          id: 'cpu',
          name: 'Processadores',
          items: cpuComponents.map(comp => ({
            id: comp.id,
            name: comp.name,
            description: comp.description,
            price: comp.price,
            type: 'cpu',
            specs: comp.specs,
            metadata: comp.metadata
          }))
        },
        memory: {
          id: 'memory',
          name: 'Memória',
          items: memoryComponents.map(comp => ({
            id: comp.id,
            name: comp.name,
            description: comp.description,
            price: comp.price,
            type: 'memory',
            specs: comp.specs,
            metadata: comp.metadata
          }))
        },
        os: {
          id: 'os',
          name: 'Sistema Operacional',
          items: osComponents.map(comp => ({
            id: comp.id,
            name: comp.name,
            description: comp.description,
            price: comp.price,
            type: 'os',
            specs: comp.specs,
            metadata: comp.metadata
          }))
        },
        connectivity: {
          id: 'connectivity',
          name: 'Conectividade',
          items: connectivityComponents.map(comp => ({
            id: comp.id,
            name: comp.name,
            description: comp.description,
            price: comp.price,
            type: 'connectivity',
            specs: comp.specs,
            metadata: comp.metadata
          }))
        },
        storage: {
          id: 'storage',
          name: 'Armazenamento',
          items: storageItems.map(item => ({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            type: 'storage',
            specs: item.specs,
            metadata: {
              capacity_gb: item.capacity_gb,
              storage_type: item.storage_type,
              item_type: item.item_type
            }
          }))
        },
        datacenter: {
          id: 'datacenter',
          name: 'Data Center',
          items: dataCenters.map(dc => ({
            id: dc.datacenter_id,
            name: dc.name,
            description: dc.description,
            price: dc.price,
            type: 'datacenter',
            specs: dc.features,
            metadata: {
              location: dc.location,
              region: dc.region,
              badge: dc.badge
            }
          }))
        },
        contract: {
          id: 'contract',
          name: 'Contratos',
          items: contractTypes.map(contract => ({
            id: contract.contract_id,
            name: contract.name,
            description: contract.description,
            price: 0,
            type: 'contract',
            specs: [`${contract.duration_months} meses`, `${contract.discount_percentage}% desconto`],
            metadata: {
              duration: contract.duration_months,
              discount: contract.discount_percentage
            }
          }))
        }
      };
      
      // Save to price service
      const saved = await PriceService.saveData(unifiedPriceData);
      
      if (saved) {
        console.log('[DataSync] Successfully synchronized unified data to price table');
        toast.success('Sincronização concluída', {
          description: 'Dados unificados sincronizados com a tabela de preços'
        });
        return true;
      }
      
      return false;
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
      const [priceData, consolidationStatus] = await Promise.all([
        PriceService.getAllData(),
        UnifiedDataService.getConsolidationStatus()
      ]);
      
      const standardCategories = ['cpu', 'memory', 'os', 'connectivity', 'storage', 'datacenter', 'contract'];
      const priceCategories = Object.keys(priceData);
      
      const missingInPrice = standardCategories.filter(cat => !priceCategories.includes(cat));
      const extraInPrice = priceCategories.filter(cat => !standardCategories.includes(cat));
      
      const itemMismatches: Record<string, { missing: number; extra: number }> = {};
      
      // Check if consolidation is needed
      if (consolidationStatus.phase !== 'completed') {
        // If not consolidated, all standard categories are considered missing
        standardCategories.forEach(cat => {
          if (!priceData[cat] || !priceData[cat].items || priceData[cat].items.length === 0) {
            itemMismatches[cat] = { missing: 1, extra: 0 };
          }
        });
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
