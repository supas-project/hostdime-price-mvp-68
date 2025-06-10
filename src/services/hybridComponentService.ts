
import { ComponentOption } from '@/types/component';
import { SystemComponentsService } from '@/services/systemComponentsService';
import { ComponentDataAdapter } from '@/services/componentDataAdapter';
import { supabase } from '@/integrations/supabase/client';

// Import static data as fallback
import { cpuComponents } from '@/data/cpu-components';
import { memoryComponents } from '@/data/memory-components';
import { dataCenterComponents } from '@/data/datacenter-components';
import { contractComponents } from '@/data/contract-components';
import { osComponents } from '@/data/os-components';
import { connectivityComponents } from '@/data/connectivity-components';

/**
 * Hybrid service that tries to load from database first, falls back to static data
 */
export class HybridComponentService {
  static async getComponentsByType(type: string): Promise<ComponentOption[]> {
    try {
      console.log(`[HybridComponentService] Loading ${type} components from database...`);
      
      // Check if user is authenticated
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log(`[HybridComponentService] Not authenticated, using static data for ${type}`);
        return this.getStaticComponentsByType(type);
      }

      // Try to load from database
      const components = await SystemComponentsService.getComponentsByType(type);
      
      if (components.length > 0) {
        console.log(`[HybridComponentService] Found ${components.length} ${type} components in database`);
        return ComponentDataAdapter.convertSystemComponentsToOptions(components);
      } else {
        console.log(`[HybridComponentService] No ${type} components in database, using static data`);
        return this.getStaticComponentsByType(type);
      }
    } catch (error) {
      console.error(`[HybridComponentService] Error loading ${type} from database:`, error);
      console.log(`[HybridComponentService] Falling back to static data for ${type}`);
      return this.getStaticComponentsByType(type);
    }
  }

  static async getDataCenters(): Promise<ComponentOption[]> {
    try {
      console.log('[HybridComponentService] Loading data centers from database...');
      
      // Check authentication
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log('[HybridComponentService] Not authenticated, using static data centers');
        return dataCenterComponents.options;
      }

      const dataCenters = await SystemComponentsService.getAllDataCenters();
      
      if (dataCenters.length > 0) {
        console.log(`[HybridComponentService] Found ${dataCenters.length} data centers in database`);
        return ComponentDataAdapter.convertDataCentersToOptions(dataCenters);
      } else {
        console.log('[HybridComponentService] No data centers in database, using static data');
        return dataCenterComponents.options;
      }
    } catch (error) {
      console.error('[HybridComponentService] Error loading data centers from database:', error);
      return dataCenterComponents.options;
    }
  }

  static async getContractTypes(): Promise<ComponentOption[]> {
    try {
      console.log('[HybridComponentService] Loading contract types from database...');
      
      // Check authentication
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        console.log('[HybridComponentService] Not authenticated, using static contract types');
        return contractComponents.options;
      }

      const contractTypes = await SystemComponentsService.getAllContractTypes();
      
      if (contractTypes.length > 0) {
        console.log(`[HybridComponentService] Found ${contractTypes.length} contract types in database`);
        return ComponentDataAdapter.convertContractTypesToOptions(contractTypes);
      } else {
        console.log('[HybridComponentService] No contract types in database, using static data');
        return contractComponents.options;
      }
    } catch (error) {
      console.error('[HybridComponentService] Error loading contract types from database:', error);
      return contractComponents.options;
    }
  }

  private static getStaticComponentsByType(type: string): ComponentOption[] {
    switch (type.toLowerCase()) {
      case 'cpu':
      case 'processor':
      case 'processador':
        return cpuComponents.options;
      case 'memory':
      case 'memoria':
        return memoryComponents.options;
      case 'os':
      case 'sistema_operacional':
      case 'sistemaoperacional':
        return osComponents.options;
      case 'connectivity':
      case 'conectividade':
        return connectivityComponents.options;
      case 'storage':
      case 'disk':
      case 'armazenamento':
        // For storage, we'll need to handle this separately as it has complex logic
        return [];
      default:
        console.warn(`[HybridComponentService] Unknown component type: ${type}`);
        return [];
    }
  }
}
