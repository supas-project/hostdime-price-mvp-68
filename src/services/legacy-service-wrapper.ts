
import { UnifiedDataService } from './unified-data-service';

/**
 * Legacy service wrapper - Provides backward compatibility
 * All methods now delegate to UnifiedDataService
 * 
 * @deprecated Use UnifiedDataService directly
 */
export class LegacyServiceWrapper {
  
  /**
   * @deprecated Use UnifiedDataService.consolidateAllData()
   */
  static async runProductionMigration(): Promise<boolean> {
    console.warn('[LegacyServiceWrapper] runProductionMigration is deprecated, use UnifiedDataService.consolidateAllData()');
    return UnifiedDataService.consolidateAllData();
  }

  /**
   * @deprecated Use UnifiedDataService.getConsolidationStatus()
   */
  static async checkMigrationStatus(): Promise<{needed: boolean; summary: string}> {
    console.warn('[LegacyServiceWrapper] checkMigrationStatus is deprecated, use UnifiedDataService.getConsolidationStatus()');
    const status = await UnifiedDataService.getConsolidationStatus();
    return {
      needed: status.phase !== 'completed',
      summary: `Consolidação ${status.phase}: ${status.components_count + status.datacenters_count + status.contracts_count + status.storage_count} itens`
    };
  }

  /**
   * @deprecated Use UnifiedDataService.getComponentsByType()
   */
  static async getComponentsByType(componentType: string) {
    console.warn('[LegacyServiceWrapper] getComponentsByType is deprecated, use UnifiedDataService.getComponentsByType()');
    return UnifiedDataService.getComponentsByType(componentType);
  }

  /**
   * @deprecated Use UnifiedDataService.getAllDataCenters()
   */
  static async getAllDataCenters() {
    console.warn('[LegacyServiceWrapper] getAllDataCenters is deprecated, use UnifiedDataService.getAllDataCenters()');
    return UnifiedDataService.getAllDataCenters();
  }

  /**
   * @deprecated Use UnifiedDataService.getAllContractTypes()
   */
  static async getAllContractTypes() {
    console.warn('[LegacyServiceWrapper] getAllContractTypes is deprecated, use UnifiedDataService.getAllContractTypes()');
    return UnifiedDataService.getAllContractTypes();
  }

  /**
   * @deprecated Use UnifiedDataService.getAllStorageItems()
   */
  static async getAllStorageItems() {
    console.warn('[LegacyServiceWrapper] getAllStorageItems is deprecated, use UnifiedDataService.getAllStorageItems()');
    return UnifiedDataService.getAllStorageItems();
  }
}

// Update existing services to use wrapper for backward compatibility
export { LegacyServiceWrapper as CoreMigrationService };
export { LegacyServiceWrapper as SystemComponentsService };
export { LegacyServiceWrapper as DataMigrationService };
