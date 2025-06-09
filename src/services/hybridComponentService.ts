
import { ComponentOption } from '@/types/component';
import { ComponentService } from './component-service-refactored';

/**
 * @deprecated Use ComponentService from component-service-refactored.ts instead
 * This file is kept for backward compatibility only
 */
export class HybridComponentService {
  static async getComponentsByType(type: string): Promise<ComponentOption[]> {
    console.warn('[HybridComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    
    switch (type.toLowerCase()) {
      case 'cpu':
      case 'processor':
      case 'processador':
        return ComponentService.getCPUComponents();
      case 'memory':
      case 'memoria':
        return ComponentService.getMemoryComponents();
      case 'os':
      case 'sistema_operacional':
      case 'sistemaoperacional':
        return ComponentService.getOSComponents();
      case 'connectivity':
      case 'conectividade':
        return ComponentService.getConnectivityComponents();
      case 'storage':
      case 'disk':
      case 'armazenamento':
        return ComponentService.getStorageComponents();
      default:
        console.warn(`[HybridComponentService] Unknown component type: ${type}`);
        return [];
    }
  }

  static async getDataCenters(): Promise<ComponentOption[]> {
    console.warn('[HybridComponentService] DEPRECATED: Use ComponentService.getDataCenters() instead');
    return ComponentService.getDataCenters();
  }

  static async getContractTypes(): Promise<ComponentOption[]> {
    console.warn('[HybridComponentService] DEPRECATED: Use ComponentService.getContractTypes() instead');
    return ComponentService.getContractTypes();
  }
}
