
import { supabase } from '@/lib/supabase';

export interface UnifiedComponent {
  component_id: string;
  id: string;
  name: string;
  description?: string;
  price: number;
  component_type: string;
  subtype?: string;
  is_hardware: boolean;
  specs: string[];
  metadata: Record<string, any>;
}

export interface UnifiedDataCenter {
  datacenter_id: string;
  name: string;
  description?: string;
  location: string;
  region?: string;
  price: number;
  badge?: string;
  features: string[];
  certifications: string[];
}

export interface UnifiedContractType {
  contract_id: string;
  name: string;
  description?: string;
  duration_months: number;
  discount_percentage: number;
}

export interface UnifiedStorageItem {
  id: string;
  name: string;
  description?: string;
  storage_type: 'internal' | 'external';
  item_type: 'nvme' | 'ssd' | 'hdd' | 'object' | 'block';
  capacity_gb: number;
  price: number;
  specs: string[];
  metadata: Record<string, any>;
}

export interface ConsolidatedDataStatus {
  phase: 'not_started' | 'consolidating' | 'completed' | 'error';
  components_count: number;
  datacenters_count: number;
  contracts_count: number;
  storage_count: number;
  last_updated: string | null;
  errors: string[];
}

/**
 * Unified Data Service - Single source of truth for all system data
 * This service consolidates data from multiple sources into the database
 */
export class UnifiedDataService {
  
  /**
   * Get consolidation status
   */
  static async getConsolidationStatus(): Promise<ConsolidatedDataStatus> {
    try {
      const { data, error } = await supabase
        .from('consolidated_data')
        .select('*')
        .eq('data_type', 'consolidation_status')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('[UnifiedDataService] Error getting consolidation status:', error);
      }

      if (!data) {
        return {
          phase: 'not_started',
          components_count: 0,
          datacenters_count: 0,
          contracts_count: 0,
          storage_count: 0,
          last_updated: null,
          errors: []
        };
      }

      return data.data as ConsolidatedDataStatus;
    } catch (error) {
      console.error('[UnifiedDataService] Error in getConsolidationStatus:', error);
      return {
        phase: 'error',
        components_count: 0,
        datacenters_count: 0,
        contracts_count: 0,
        storage_count: 0,
        last_updated: null,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Consolidate all data from static sources into database
   */
  static async consolidateAllData(): Promise<boolean> {
    try {
      console.log('[UnifiedDataService] Starting data consolidation...');
      
      // Mark consolidation as started
      await this.updateConsolidationStatus('consolidating');
      
      // Import and consolidate static data
      const staticData = await this.importStaticData();
      
      // Save consolidated data to database
      await this.saveConsolidatedData(staticData);
      
      // Mark consolidation as completed
      await this.updateConsolidationStatus('completed');
      
      console.log('[UnifiedDataService] Data consolidation completed successfully');
      return true;
    } catch (error) {
      console.error('[UnifiedDataService] Error during consolidation:', error);
      await this.updateConsolidationStatus('error', [error instanceof Error ? error.message : 'Unknown error']);
      return false;
    }
  }

  /**
   * Import static data from data files
   */
  private static async importStaticData() {
    // Import components using correct file names and exports
    const cpuData = await import('@/data/cpu-components').then(m => m.cpuComponents);
    const memoryData = await import('@/data/memory-components').then(m => m.memoryComponents);
    const osData = await import('@/data/os-components').then(m => m.osComponents);
    const connectivityData = await import('@/data/connectivity-components').then(m => m.connectivityComponents);
    
    // Import datacenter and contract data using correct file names
    const dataCenterData = await import('@/data/datacenter-components').then(m => m.dataCenterComponents);
    const contractData = await import('@/data/contract-components').then(m => m.contractComponents);
    
    // Get disk data from existing storage pricing
    const diskData = await import('@/data/disk-data').then(m => m.diskData);
    
    // External storage data 
    const externalStorageData = [
      {
        id: 'object_storage_standard',
        name: 'Object Storage Standard',
        storage_type: 'external',
        item_type: 'object',
        capacity_gb: 1000,
        price: 50,
        description: 'Armazenamento de objetos padrão'
      },
      {
        id: 'block_storage_ssd',
        name: 'Block Storage SSD',
        storage_type: 'external', 
        item_type: 'block',
        capacity_gb: 500,
        price: 80,
        description: 'Armazenamento em bloco SSD'
      }
    ];

    return {
      components: [
        ...cpuData.options.map(item => ({ ...item, component_type: 'cpu' })),
        ...memoryData.options.map(item => ({ ...item, component_type: 'memory' })),
        ...osData.options.map(item => ({ ...item, component_type: 'os' })),
        ...connectivityData.options.map(item => ({ ...item, component_type: 'connectivity' }))
      ],
      datacenters: dataCenterData.options,
      contracts: contractData.options,
      storage: [
        ...diskData.map(item => ({
          ...item,
          storage_type: 'internal',
          item_type: item.type,
          capacity_gb: parseInt(item.capacity.replace(/[^\d]/g, '')) || 0
        })),
        ...externalStorageData
      ]
    };
  }

  /**
   * Save consolidated data to database
   */
  private static async saveConsolidatedData(data: any) {
    const { error } = await supabase
      .from('consolidated_data')
      .insert({
        data_type: 'unified_data',
        data: data
      });

    if (error) {
      throw new Error(`Failed to save consolidated data: ${error.message}`);
    }
  }

  /**
   * Update consolidation status
   */
  private static async updateConsolidationStatus(
    phase: ConsolidatedDataStatus['phase'], 
    errors: string[] = []
  ) {
    const status: ConsolidatedDataStatus = {
      phase,
      components_count: 0,
      datacenters_count: 0,
      contracts_count: 0,
      storage_count: 0,
      last_updated: new Date().toISOString(),
      errors
    };

    await supabase
      .from('consolidated_data')
      .insert({
        data_type: 'consolidation_status',
        data: status
      });
  }

  /**
   * Get components by type from unified data
   */
  static async getComponentsByType(componentType: string): Promise<UnifiedComponent[]> {
    try {
      const { data, error } = await supabase
        .from('consolidated_data')
        .select('data')
        .eq('data_type', 'unified_data')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.warn(`[UnifiedDataService] No unified data found for type ${componentType}`);
        return [];
      }

      const unifiedData = data.data;
      const components = unifiedData.components || [];
      
      return components
        .filter((comp: any) => comp.component_type === componentType)
        .map((comp: any) => ({
          component_id: comp.id,
          id: comp.id,
          name: comp.name,
          description: comp.description || '',
          price: comp.price || 0,
          component_type: comp.component_type,
          subtype: comp.subtype || 'standard',
          is_hardware: comp.isHardware || false,
          specs: Array.isArray(comp.specs) ? comp.specs : [],
          metadata: comp.metadata || {}
        }));
    } catch (error) {
      console.error(`[UnifiedDataService] Error getting components for type ${componentType}:`, error);
      return [];
    }
  }

  /**
   * Get all data centers from unified data
   */
  static async getAllDataCenters(): Promise<UnifiedDataCenter[]> {
    try {
      const { data, error } = await supabase
        .from('consolidated_data')
        .select('data')
        .eq('data_type', 'unified_data')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return [];
      }

      const unifiedData = data.data;
      const datacenters = unifiedData.datacenters || [];
      
      return datacenters.map((dc: any) => ({
        datacenter_id: dc.id,
        name: dc.name,
        description: dc.description || '',
        location: dc.location || '',
        region: dc.region || '',
        price: dc.price || 0,
        badge: dc.badge || '',
        features: Array.isArray(dc.features) ? dc.features : [],
        certifications: Array.isArray(dc.certifications) ? dc.certifications : []
      }));
    } catch (error) {
      console.error('[UnifiedDataService] Error getting data centers:', error);
      return [];
    }
  }

  /**
   * Get all contract types from unified data
   */
  static async getAllContractTypes(): Promise<UnifiedContractType[]> {
    try {
      const { data, error } = await supabase
        .from('consolidated_data')
        .select('data')
        .eq('data_type', 'unified_data')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return [];
      }

      const unifiedData = data.data;
      const contracts = unifiedData.contracts || [];
      
      return contracts.map((contract: any) => ({
        contract_id: contract.id,
        name: contract.name,
        description: contract.description || '',
        duration_months: contract.duration || 12,
        discount_percentage: contract.discount || 0
      }));
    } catch (error) {
      console.error('[UnifiedDataService] Error getting contract types:', error);
      return [];
    }
  }

  /**
   * Get all storage items from unified data
   */
  static async getAllStorageItems(): Promise<UnifiedStorageItem[]> {
    try {
      const { data, error } = await supabase
        .from('consolidated_data')
        .select('data')
        .eq('data_type', 'unified_data')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return [];
      }

      const unifiedData = data.data;
      const storage = unifiedData.storage || [];
      
      return storage.map((item: any) => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        storage_type: item.storage_type || 'internal',
        item_type: item.item_type || 'ssd',
        capacity_gb: item.capacity_gb || item.capacity || 0,
        price: item.price || 0,
        specs: Array.isArray(item.specs) ? item.specs : [],
        metadata: item.metadata || {}
      }));
    } catch (error) {
      console.error('[UnifiedDataService] Error getting storage items:', error);
      return [];
    }
  }
}
