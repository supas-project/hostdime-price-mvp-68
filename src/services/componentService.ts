
import { ComponentOption } from '@/types/component';
import { ComponentService as RefactoredComponentService } from './component-service-refactored';

/**
 * @deprecated Use ComponentService from component-service-refactored.ts instead
 * This file is kept for backward compatibility only
 */
export class ComponentService {
  static async getCPUComponents(): Promise<ComponentOption[]> {
    console.warn('[ComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    return RefactoredComponentService.getCPUComponents();
  }

  static async getMemoryComponents(): Promise<ComponentOption[]> {
    console.warn('[ComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    return RefactoredComponentService.getMemoryComponents();
  }

  static async getOSComponents(): Promise<ComponentOption[]> {
    console.warn('[ComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    return RefactoredComponentService.getOSComponents();
  }

  static async getConnectivityComponents(): Promise<ComponentOption[]> {
    console.warn('[ComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    return RefactoredComponentService.getConnectivityComponents();
  }

  static async getStorageComponents(): Promise<ComponentOption[]> {
    console.warn('[ComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    return RefactoredComponentService.getStorageComponents();
  }

  static async getDataCenters(): Promise<ComponentOption[]> {
    console.warn('[ComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    return RefactoredComponentService.getDataCenters();
  }

  static async getContractTypes(): Promise<ComponentOption[]> {
    console.warn('[ComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    return RefactoredComponentService.getContractTypes();
  }

  static async getAllComponentsByCategory(): Promise<{ [key: string]: ComponentOption[] }> {
    console.warn('[ComponentService] DEPRECATED: Use ComponentService from component-service-refactored.ts instead');
    return RefactoredComponentService.getAllComponentsByCategory();
  }
}
