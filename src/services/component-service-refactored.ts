
import { ComponentOption } from '@/types/component';
import { UnifiedDataService } from './unified-data-service';

/**
 * Refactored Component Service - Clean interface using UnifiedDataService
 * Replaces the old HybridComponentService and ComponentService
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
        capacity: item.capacity_gb,
        storageType: item.storage_type,
        itemType: item.item_type,
        ...item.metadata
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
   * Get all components by category
   */
  static async getAllComponentsByCategory(): Promise<{ [key: string]: ComponentOption[] }> {
    try {
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

      return {
        cpu: cpuComponents,
        memory: memoryComponents,
        os: osComponents,
        connectivity: connectivityComponents,
        storage: storageComponents,
        datacenter: dataCenters,
        contract: contractTypes
      };
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
}
