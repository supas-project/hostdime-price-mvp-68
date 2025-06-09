
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import static data for migration
import { cpuComponents } from '@/data/cpu-components';
import { memoryComponents } from '@/data/memory-components';
import { osComponents } from '@/data/os-components';
import { connectivityComponents } from '@/data/connectivity-components';
import { dataCenterComponents } from '@/data/datacenter-components';
import { contractComponents } from '@/data/contract-components';

export interface ConsolidatedDataStatus {
  phase: 'starting' | 'migrating' | 'completed' | 'error';
  completed_steps: string[];
  total_items: number;
  migrated_items: number;
  errors: string[];
}

export interface UnifiedComponent {
  id: string;
  component_type: string;
  component_id: string;
  name: string;
  description?: string;
  price: number;
  subtype?: string;
  is_hardware: boolean;
  is_active: boolean;
  specs?: string[];
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UnifiedDataCenter {
  id: string;
  datacenter_id: string;
  name: string;
  description?: string;
  location: string;
  region?: string;
  price: number;
  features?: string[];
  certifications?: string[];
  badge?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnifiedContractType {
  id: string;
  contract_id: string;
  name: string;
  description?: string;
  duration_months: number;
  discount_percentage: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UnifiedStorageItem {
  id: string;
  storage_type: string;
  item_type: string;
  capacity_gb?: number;
  name: string;
  description?: string;
  price: number;
  specs?: string[];
  metadata?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Unified Data Service - Single source of truth for all application data
 * Replaces fragmented data loading and provides consistent interface
 */
export class UnifiedDataService {
  
  /**
   * Get consolidation status
   */
  static async getConsolidationStatus(): Promise<ConsolidatedDataStatus> {
    try {
      const { data } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'data_consolidation_status')
        .single();

      if (data?.value && typeof data.value === 'object') {
        return data.value as ConsolidatedDataStatus;
      }

      return {
        phase: 'starting',
        completed_steps: [],
        total_items: 0,
        migrated_items: 0,
        errors: []
      };
    } catch (error) {
      console.error('[UnifiedDataService] Error getting consolidation status:', error);
      return {
        phase: 'error',
        completed_steps: [],
        total_items: 0,
        migrated_items: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  /**
   * Update consolidation status
   */
  static async updateConsolidationStatus(status: ConsolidatedDataStatus): Promise<void> {
    await supabase
      .from('system_settings')
      .upsert({
        key: 'data_consolidation_status',
        value: status as any,
        description: 'Track data consolidation progress'
      });
  }

  /**
   * Consolidate all static data into database
   */
  static async consolidateAllData(): Promise<void> {
    console.log('[UnifiedDataService] Starting complete data consolidation...');
    
    const status: ConsolidatedDataStatus = {
      phase: 'migrating',
      completed_steps: [],
      total_items: 0,
      migrated_items: 0,
      errors: []
    };

    try {
      // Check authentication
      const { data: session } = await supabase.auth.getSession();
      if (!session.session || session.session.user.email !== "admin@hostdime.com.br") {
        throw new Error('Only admin can perform data consolidation');
      }

      await this.updateConsolidationStatus(status);

      // Calculate total items
      status.total_items = 
        cpuComponents.options.length +
        memoryComponents.options.length +
        osComponents.options.length +
        connectivityComponents.options.length +
        dataCenterComponents.options.length +
        contractComponents.options.length +
        10; // Storage items

      toast.info('Iniciando consolidação de dados...', {
        description: `${status.total_items} itens serão processados`
      });

      // Step 1: Consolidate CPU Components
      await this.consolidateCPUComponents();
      status.completed_steps.push('cpu_components');
      status.migrated_items += cpuComponents.options.length;
      await this.updateConsolidationStatus(status);

      // Step 2: Consolidate Memory Components
      await this.consolidateMemoryComponents();
      status.completed_steps.push('memory_components');
      status.migrated_items += memoryComponents.options.length;
      await this.updateConsolidationStatus(status);

      // Step 3: Consolidate OS Components
      await this.consolidateOSComponents();
      status.completed_steps.push('os_components');
      status.migrated_items += osComponents.options.length;
      await this.updateConsolidationStatus(status);

      // Step 4: Consolidate Connectivity Components
      await this.consolidateConnectivityComponents();
      status.completed_steps.push('connectivity_components');
      status.migrated_items += connectivityComponents.options.length;
      await this.updateConsolidationStatus(status);

      // Step 5: Consolidate Data Centers
      await this.consolidateDataCenters();
      status.completed_steps.push('datacenters');
      status.migrated_items += dataCenterComponents.options.length;
      await this.updateConsolidationStatus(status);

      // Step 6: Consolidate Contract Types
      await this.consolidateContractTypes();
      status.completed_steps.push('contract_types');
      status.migrated_items += contractComponents.options.length;
      await this.updateConsolidationStatus(status);

      // Step 7: Consolidate Storage Items
      await this.consolidateStorageItems();
      status.completed_steps.push('storage_items');
      status.migrated_items += 10;
      await this.updateConsolidationStatus(status);

      // Mark as completed
      status.phase = 'completed';
      await this.updateConsolidationStatus(status);

      // Update data version
      await supabase
        .from('system_settings')
        .upsert({
          key: 'data_version',
          value: {
            current: 1,
            last_migration: new Date().toISOString()
          } as any,
          description: 'Track data version for consistency'
        });

      toast.success('Consolidação de dados concluída!', {
        description: `${status.migrated_items} itens migrados com sucesso`
      });

      console.log('[UnifiedDataService] Data consolidation completed successfully');
      
    } catch (error) {
      console.error('[UnifiedDataService] Error in data consolidation:', error);
      status.phase = 'error';
      status.errors.push(error instanceof Error ? error.message : 'Unknown error');
      await this.updateConsolidationStatus(status);
      
      toast.error('Erro na consolidação de dados', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  /**
   * Get all components by type
   */
  static async getComponentsByType(componentType: string): Promise<UnifiedComponent[]> {
    const { data, error } = await supabase
      .from('system_components')
      .select('*')
      .eq('component_type', componentType)
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch ${componentType} components: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      specs: Array.isArray(item.specs) ? item.specs as string[] : [],
      metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {}
    }));
  }

  /**
   * Get all data centers
   */
  static async getAllDataCenters(): Promise<UnifiedDataCenter[]> {
    const { data, error } = await supabase
      .from('datacenters')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      throw new Error(`Failed to fetch data centers: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      features: Array.isArray(item.features) ? item.features as string[] : [],
      certifications: Array.isArray(item.certifications) ? item.certifications as string[] : []
    }));
  }

  /**
   * Get all contract types
   */
  static async getAllContractTypes(): Promise<UnifiedContractType[]> {
    const { data, error } = await supabase
      .from('contract_types')
      .select('*')
      .eq('is_active', true)
      .order('duration_months');

    if (error) {
      throw new Error(`Failed to fetch contract types: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all storage items
   */
  static async getAllStorageItems(): Promise<UnifiedStorageItem[]> {
    const { data, error } = await supabase
      .from('storage_items')
      .select('*')
      .eq('is_active', true)
      .order('storage_type')
      .order('capacity_gb');

    if (error) {
      throw new Error(`Failed to fetch storage items: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      specs: Array.isArray(item.specs) ? item.specs as string[] : [],
      metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {}
    }));
  }

  // Private consolidation methods
  private static async consolidateCPUComponents(): Promise<void> {
    for (const component of cpuComponents.options) {
      await supabase.from('system_components').upsert({
        component_type: 'cpu',
        component_id: component.id,
        name: component.name,
        description: component.description,
        price: component.price,
        subtype: component.subtype,
        is_hardware: component.isHardware || true,
        is_active: true,
        specs: component.specs || [],
        metadata: component.metadata || {}
      });
    }
  }

  private static async consolidateMemoryComponents(): Promise<void> {
    for (const component of memoryComponents.options) {
      await supabase.from('system_components').upsert({
        component_type: 'memory',
        component_id: component.id,
        name: component.name,
        description: component.description,
        price: component.price,
        subtype: component.subtype,
        is_hardware: component.isHardware || true,
        is_active: true,
        specs: component.specs || [],
        metadata: component.metadata || {}
      });
    }
  }

  private static async consolidateOSComponents(): Promise<void> {
    for (const component of osComponents.options) {
      await supabase.from('system_components').upsert({
        component_type: 'os',
        component_id: component.id,
        name: component.name,
        description: component.description,
        price: component.price,
        subtype: component.subtype,
        is_hardware: component.isHardware || false,
        is_active: true,
        specs: component.specs || [],
        metadata: component.metadata || {}
      });
    }
  }

  private static async consolidateConnectivityComponents(): Promise<void> {
    for (const component of connectivityComponents.options) {
      await supabase.from('system_components').upsert({
        component_type: 'connectivity',
        component_id: component.id,
        name: component.name,
        description: component.description,
        price: component.price,
        subtype: component.subtype,
        is_hardware: component.isHardware || false,
        is_active: true,
        specs: component.specs || [],
        metadata: component.metadata || {}
      });
    }
  }

  private static async consolidateDataCenters(): Promise<void> {
    for (const dc of dataCenterComponents.options) {
      await supabase.from('datacenters').upsert({
        datacenter_id: dc.id,
        name: dc.name,
        description: dc.description,
        location: dc.metadata?.location || 'N/A',
        region: dc.metadata?.region || '',
        price: dc.price,
        features: dc.metadata?.features || [],
        certifications: dc.metadata?.certifications || [],
        badge: dc.metadata?.badge || '',
        is_active: true
      });
    }
  }

  private static async consolidateContractTypes(): Promise<void> {
    for (const contract of contractComponents.options) {
      await supabase.from('contract_types').upsert({
        contract_id: contract.id,
        name: contract.name,
        description: contract.description,
        duration_months: parseInt(contract.subtype || '0'),
        discount_percentage: contract.metadata?.discount || 0,
        is_active: true
      });
    }
  }

  private static async consolidateStorageItems(): Promise<void> {
    const defaultStorageItems = [
      // Internal storage
      { storage_type: 'internal', item_type: 'nvme', capacity_gb: 500, name: '500GB NVMe', description: 'High-performance NVMe SSD', price: 150 },
      { storage_type: 'internal', item_type: 'nvme', capacity_gb: 1000, name: '1TB NVMe', description: 'High-performance NVMe SSD', price: 280 },
      { storage_type: 'internal', item_type: 'ssd', capacity_gb: 500, name: '500GB SSD', description: 'SATA SSD', price: 100 },
      { storage_type: 'internal', item_type: 'ssd', capacity_gb: 1000, name: '1TB SSD', description: 'SATA SSD', price: 180 },
      { storage_type: 'internal', item_type: 'hdd', capacity_gb: 1000, name: '1TB HDD', description: 'SATA HDD', price: 60 },
      { storage_type: 'internal', item_type: 'hdd', capacity_gb: 2000, name: '2TB HDD', description: 'SATA HDD', price: 90 },
      
      // External storage
      { storage_type: 'external', item_type: 'standard', capacity_gb: 100, name: '100GB Standard', description: 'Standard block storage', price: 20 },
      { storage_type: 'external', item_type: 'standard', capacity_gb: 500, name: '500GB Standard', description: 'Standard block storage', price: 80 },
      { storage_type: 'external', item_type: 'ultra', capacity_gb: 100, name: '100GB Ultra', description: 'Ultra-fast block storage', price: 40 },
      { storage_type: 'external', item_type: 'ultra', capacity_gb: 500, name: '500GB Ultra', description: 'Ultra-fast block storage', price: 180 }
    ];

    for (const item of defaultStorageItems) {
      await supabase.from('storage_items').upsert({
        storage_type: item.storage_type,
        item_type: item.item_type,
        capacity_gb: item.capacity_gb,
        name: item.name,
        description: item.description,
        price: item.price,
        specs: [],
        metadata: {},
        is_active: true
      });
    }
  }
}
