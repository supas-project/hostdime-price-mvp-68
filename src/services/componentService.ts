
import { ComponentOption } from '@/types/component';
import { HybridComponentService } from '@/services/hybridComponentService';

/**
 * Main component service that provides a unified interface for all components
 * Uses the hybrid service to prioritize database data over static data
 */
export class ComponentService {
  static async getCPUComponents(): Promise<ComponentOption[]> {
    return await HybridComponentService.getComponentsByType('cpu');
  }

  static async getMemoryComponents(): Promise<ComponentOption[]> {
    return await HybridComponentService.getComponentsByType('memory');
  }

  static async getOSComponents(): Promise<ComponentOption[]> {
    return await HybridComponentService.getComponentsByType('os');
  }

  static async getConnectivityComponents(): Promise<ComponentOption[]> {
    return await HybridComponentService.getComponentsByType('connectivity');
  }

  static async getStorageComponents(): Promise<ComponentOption[]> {
    return await HybridComponentService.getComponentsByType('storage');
  }

  static async getDataCenters(): Promise<ComponentOption[]> {
    return await HybridComponentService.getDataCenters();
  }

  static async getContractTypes(): Promise<ComponentOption[]> {
    return await HybridComponentService.getContractTypes();
  }

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
}
