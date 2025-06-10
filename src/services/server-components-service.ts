
import { ComponentService } from '@/services/component-service-refactored';
import { ComponentOption } from '@/types/component';

/**
 * Service for managing server components with unified data access
 */
export class ServerComponentsService {
  /**
   * Get all CPU components
   */
  static async getCPUComponents(): Promise<ComponentOption[]> {
    return await ComponentService.getCPUComponents();
  }

  /**
   * Get all memory components
   */
  static async getMemoryComponents(): Promise<ComponentOption[]> {
    return await ComponentService.getMemoryComponents();
  }

  /**
   * Get all OS components
   */
  static async getOSComponents(): Promise<ComponentOption[]> {
    return await ComponentService.getOSComponents();
  }

  /**
   * Get all storage components
   */
  static async getStorageComponents(): Promise<ComponentOption[]> {
    return await ComponentService.getStorageComponents();
  }

  /**
   * Get all connectivity components
   */
  static async getConnectivityComponents(): Promise<ComponentOption[]> {
    return await ComponentService.getConnectivityComponents();
  }

  /**
   * Get all datacenter options
   */
  static async getDataCenters(): Promise<ComponentOption[]> {
    return await ComponentService.getDataCenters();
  }

  /**
   * Get all contract types
   */
  static async getContractTypes(): Promise<ComponentOption[]> {
    return await ComponentService.getContractTypes();
  }
}
