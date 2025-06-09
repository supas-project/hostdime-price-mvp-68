
import { ComponentOption } from '@/types/component';
import { UnifiedDataService } from './unified-data-service';

/**
 * Unified Component Service - Single source of truth using UnifiedDataService
 * All data now comes from the database through UnifiedDataService
 */
export class ComponentService {
  
  /**
   * Get CPU components as ComponentOption[]
   */
  static async getCPUComponents(): Promise<ComponentOption[]> {
    const components = await UnifiedDataService.getComponentsByType('cpu');
    return this.convertToComponentOptions(components, 'cpu');
  }

  /**
   * Get Memory components as ComponentOption[]
   */
  static async getMemoryComponents(): Promise<ComponentOption[]> {
    const components = await UnifiedDataService.getComponentsByType('memory');
    return this.convertToComponentOptions(components, 'memory');
  }

  /**
   * Get OS components as ComponentOption[]
   */
  static async getOSComponents(): Promise<ComponentOption[]> {
    const components = await UnifiedDataService.getComponentsByType('os');
    return this.convertToComponentOptions(components, 'os');
  }

  /**
   * Get Connectivity components as ComponentOption[]
   */
  static async getConnectivityComponents(): Promise<ComponentOption[]> {
    const components = await UnifiedDataService.getComponentsByType('connectivity');
    return this.convertToComponentOptions(components, 'connectivity');
  }

  /**
   * Get Storage components as ComponentOption[]
   */
  static async getStorageComponents(): Promise<ComponentOption[]> {
    const storageItems = await UnifiedDataService.getAllStorageItems();
    return storageItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      type: 'storage',
      subtype: `${item.storage_type}_${item.item_type}`,
      isHardware: true,
      specs: Array.isArray(item.specs) ? item.specs : [],
      metadata: {
        ...item.metadata,
        storage_type: item.storage_type,
        item_type: item.item_type,
        capacity_gb: item.capacity_gb,
        unitInfo: `${item.capacity_gb}GB ${item.item_type.toUpperCase()}`,
        features: Array.isArray(item.specs) ? item.specs : []
      }
    }));
  }

  /**
   * Get Data Centers as ComponentOption[]
   */
  static async getDataCenters(): Promise<ComponentOption[]> {
    const dataCenters = await UnifiedDataService.getAllDataCenters();
    return dataCenters.map(dc => ({
      id: dc.datacenter_id,
      name: dc.name,
      description: dc.description || '',
      price: dc.price,
      type: 'datacenter',
      subtype: dc.region || 'standard',
      isHardware: false,
      specs: dc.features || [],
      metadata: {
        location: dc.location,
        region: dc.region,
        badge: dc.badge,
        features: dc.features,
        certifications: dc.certifications
      }
    }));
  }

  /**
   * Get Contract Types as ComponentOption[]
   */
  static async getContractTypes(): Promise<ComponentOption[]> {
    const contractTypes = await UnifiedDataService.getAllContractTypes();
    return contractTypes.map(contract => ({
      id: contract.contract_id,
      name: contract.name,
      description: contract.description || '',
      price: 0, // Contracts don't have direct price, they have discount
      type: 'contract',
      subtype: `${contract.duration_months}months`,
      isHardware: false,
      specs: [`${contract.duration_months} meses`, `${contract.discount_percentage}% desconto`],
      metadata: {
        duration: contract.duration_months,
        discount: contract.discount_percentage
      }
    }));
  }

  /**
   * Get all components by category with standardized category IDs
   */
  static async getAllComponentsByCategory(): Promise<{ [key: string]: ComponentOption[] }> {
    try {
      console.log('[ComponentService] Loading all components from unified data service...');
      
      const [
        cpuComponents,
        memoryComponents,
        osComponents,
        connectivityComponents,
        storageComponents,
        dataCenters,
        contractTypes
      ] = await Promise.all([
        this.getCPUComponents(),
        this.getMemoryComponents(),
        this.getOSComponents(),
        this.getConnectivityComponents(),
        this.getStorageComponents(),
        this.getDataCenters(),
        this.getContractTypes()
      ]);

      // Use standardized category IDs to match price table
      const standardizedCategories = {
        // Standard category mappings
        cpu: cpuComponents,
        memory: memoryComponents,
        os: osComponents,
        connectivity: connectivityComponents,
        storage: storageComponents,
        datacenter: dataCenters,
        contract: contractTypes,
        
        // Alternative mappings for price table compatibility
        processor: cpuComponents, // Maps to cpu
        memoria: memoryComponents, // Maps to memory
        sistemaoperacional: osComponents // Maps to os
      };

      console.log('[ComponentService] Categories loaded:', Object.keys(standardizedCategories));
      return standardizedCategories;
    } catch (error) {
      console.error('[ComponentService] Error loading all components:', error);
      throw error;
    }
  }

  /**
   * Convert UnifiedComponent to ComponentOption
   */
  private static convertToComponentOptions(components: any[], type: string): ComponentOption[] {
    return components.map(component => ({
      id: component.component_id || component.id,
      name: component.name,
      description: component.description || '',
      price: component.price,
      type: type,
      subtype: component.subtype || 'standard',
      isHardware: component.is_hardware || false,
      specs: Array.isArray(component.specs) ? component.specs : [],
      metadata: component.metadata || {}
    }));
  }

  /**
   * Trigger data consolidation if needed
   */
  static async ensureDataConsolidation(): Promise<void> {
    try {
      const status = await UnifiedDataService.getConsolidationStatus();
      
      if (status.phase !== 'completed') {
        console.log('[ComponentService] Data consolidation needed, triggering...');
        await UnifiedDataService.consolidateAllData();
      } else {
        console.log('[ComponentService] Data already consolidated');
      }
    } catch (error) {
      console.error('[ComponentService] Error ensuring data consolidation:', error);
      // Don't throw here, let the app continue with existing data
    }
  }
}
