
import { SystemComponentsService } from '@/services/systemComponentsService';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Import static data
import { cpuComponents } from '@/data/cpu-components';
import { memoryComponents } from '@/data/memory-components';
import { osComponents } from '@/data/os-components';
import { connectivityComponents } from '@/data/connectivity-components';
import { dataCenterComponents } from '@/data/datacenter-components';
import { contractComponents } from '@/data/contract-components';
import { storageComponents } from '@/data/storage-components';

export interface MigrationStatus {
  needed: boolean;
  summary: string;
  details: {
    cpu: number;
    memory: number;
    os: number;
    connectivity: number;
    storage: number;
    datacenters: number;
    contracts: number;
  };
  totalMissing: number;
}

/**
 * Enhanced Data Migration Service for production readiness
 */
export class CoreMigrationService {
  
  /**
   * Check comprehensive migration status
   */
  static async checkMigrationStatus(): Promise<MigrationStatus> {
    try {
      console.log('[CoreMigrationService] Checking comprehensive migration status...');
      
      const [
        cpuCount,
        memoryCount,
        osCount,
        connectivityCount,
        storageCount,
        dcCount,
        contractCount
      ] = await Promise.all([
        supabase.from('system_components').select('id', { count: 'exact' }).eq('component_type', 'cpu'),
        supabase.from('system_components').select('id', { count: 'exact' }).eq('component_type', 'memory'),
        supabase.from('system_components').select('id', { count: 'exact' }).eq('component_type', 'os'),
        supabase.from('system_components').select('id', { count: 'exact' }).eq('component_type', 'connectivity'),
        supabase.from('storage_items').select('id', { count: 'exact' }),
        supabase.from('datacenters').select('id', { count: 'exact' }),
        supabase.from('contract_types').select('id', { count: 'exact' })
      ]);

      const details = {
        cpu: cpuCount.count || 0,
        memory: memoryCount.count || 0,
        os: osCount.count || 0,
        connectivity: connectivityCount.count || 0,
        storage: storageCount.count || 0,
        datacenters: dcCount.count || 0,
        contracts: contractCount.count || 0
      };

      const totalInDb = Object.values(details).reduce((sum, count) => sum + count, 0);
      const expectedCounts = {
        cpu: cpuComponents.options.length,
        memory: memoryComponents.options.length,
        os: osComponents.options.length,
        connectivity: connectivityComponents.options.length,
        storage: storageComponents.internal.length + storageComponents.external.length,
        datacenters: dataCenterComponents.options.length,
        contracts: contractComponents.options.length
      };

      const totalExpected = Object.values(expectedCounts).reduce((sum, count) => sum + count, 0);
      const totalMissing = totalExpected - totalInDb;
      
      const needed = totalMissing > 0;
      
      const summary = `DB: ${details.cpu}/${expectedCounts.cpu} CPUs, ${details.memory}/${expectedCounts.memory} RAM, ${details.os}/${expectedCounts.os} OS, ${details.connectivity}/${expectedCounts.connectivity} conectividade, ${details.storage}/${expectedCounts.storage} storage, ${details.datacenters}/${expectedCounts.datacenters} DCs, ${details.contracts}/${expectedCounts.contracts} contratos`;

      return { needed, summary, details, totalMissing };
    } catch (error) {
      console.error('[CoreMigrationService] Error checking migration status:', error);
      return {
        needed: true,
        summary: 'Erro ao verificar status',
        details: { cpu: 0, memory: 0, os: 0, connectivity: 0, storage: 0, datacenters: 0, contracts: 0 },
        totalMissing: 0
      };
    }
  }

  /**
   * Migrate storage components to new storage_items table
   */
  static async migrateStorageComponents(): Promise<void> {
    console.log('[CoreMigrationService] Starting storage migration...');
    
    try {
      // Migrate internal storage
      for (const item of storageComponents.internal) {
        const { data: existing } = await supabase
          .from('storage_items')
          .select('id')
          .eq('storage_type', 'internal')
          .eq('item_type', item.type)
          .eq('name', item.name)
          .single();

        if (!existing) {
          await supabase.from('storage_items').insert({
            storage_type: 'internal',
            item_type: item.type,
            capacity_gb: item.metadata?.capacity || 0,
            name: item.name,
            description: item.description,
            price: item.price,
            specs: item.specs || [],
            metadata: item.metadata || {},
            is_active: true
          });
          
          console.log(`[CoreMigrationService] Created internal storage: ${item.name}`);
        }
      }

      // Migrate external storage
      for (const item of storageComponents.external) {
        const { data: existing } = await supabase
          .from('storage_items')
          .select('id')
          .eq('storage_type', 'external')
          .eq('item_type', item.type)
          .eq('name', item.name)
          .single();

        if (!existing) {
          await supabase.from('storage_items').insert({
            storage_type: 'external',
            item_type: item.type,
            capacity_gb: item.metadata?.capacity || 0,
            name: item.name,
            description: item.description,
            price: item.price,
            specs: item.specs || [],
            metadata: item.metadata || {},
            is_active: true
          });
          
          console.log(`[CoreMigrationService] Created external storage: ${item.name}`);
        }
      }
    } catch (error) {
      console.error('[CoreMigrationService] Error migrating storage components:', error);
      throw error;
    }
  }

  /**
   * Run complete migration for production readiness
   */
  static async runProductionMigration(): Promise<void> {
    console.log('[CoreMigrationService] Starting production migration...');
    
    try {
      // Check authentication
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        throw new Error('User must be authenticated to run migration');
      }

      toast.info('Iniciando migração completa...', {
        description: 'Esta operação pode levar alguns minutos'
      });

      // Run all migrations in sequence
      await this.migrateCPUComponents();
      await this.migrateMemoryComponents();
      await this.migrateOSComponents();
      await this.migrateConnectivityComponents();
      await this.migrateStorageComponents();
      await this.migrateDataCenters();
      await this.migrateContractTypes();
      await this.initializeSystemSettings();
      
      console.log('[CoreMigrationService] Production migration completed successfully');
      toast.success('Migração de produção concluída!', {
        description: 'Todos os dados foram migrados para o banco de dados'
      });
      
    } catch (error) {
      console.error('[CoreMigrationService] Error in production migration:', error);
      toast.error('Erro na migração de produção', {
        description: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      throw error;
    }
  }

  /**
   * Migrate CPU components using existing service
   */
  private static async migrateCPUComponents(): Promise<void> {
    for (const component of cpuComponents.options) {
      const existingComponents = await SystemComponentsService.getComponentsByType('cpu');
      const exists = existingComponents.find(c => c.component_id === component.id);
      
      if (!exists) {
        await SystemComponentsService.createComponent({
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
  }

  /**
   * Migrate Memory components using existing service
   */
  private static async migrateMemoryComponents(): Promise<void> {
    for (const component of memoryComponents.options) {
      const existingComponents = await SystemComponentsService.getComponentsByType('memory');
      const exists = existingComponents.find(c => c.component_id === component.id);
      
      if (!exists) {
        await SystemComponentsService.createComponent({
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
  }

  /**
   * Migrate OS components using existing service
   */
  private static async migrateOSComponents(): Promise<void> {
    for (const component of osComponents.options) {
      const existingComponents = await SystemComponentsService.getComponentsByType('os');
      const exists = existingComponents.find(c => c.component_id === component.id);
      
      if (!exists) {
        await SystemComponentsService.createComponent({
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
  }

  /**
   * Migrate Connectivity components using existing service
   */
  private static async migrateConnectivityComponents(): Promise<void> {
    for (const component of connectivityComponents.options) {
      const existingComponents = await SystemComponentsService.getComponentsByType('connectivity');
      const exists = existingComponents.find(c => c.component_id === component.id);
      
      if (!exists) {
        await SystemComponentsService.createComponent({
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
  }

  /**
   * Migrate Data Centers using existing service approach
   */
  private static async migrateDataCenters(): Promise<void> {
    for (const dc of dataCenterComponents.options) {
      const { data: existing } = await supabase
        .from('datacenters')
        .select('id')
        .eq('datacenter_id', dc.id)
        .single();
      
      if (!existing) {
        await supabase.from('datacenters').insert({
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
  }

  /**
   * Migrate Contract Types using existing service approach
   */
  private static async migrateContractTypes(): Promise<void> {
    for (const contract of contractComponents.options) {
      const { data: existing } = await supabase
        .from('contract_types')
        .select('id')
        .eq('contract_id', contract.id)
        .single();
      
      if (!existing) {
        await supabase.from('contract_types').insert({
          contract_id: contract.id,
          name: contract.name,
          description: contract.description,
          duration_months: parseInt(contract.subtype || '0'),
          discount_percentage: contract.metadata?.discount || 0,
          is_active: true
        });
      }
    }
  }

  /**
   * Initialize system settings for production
   */
  private static async initializeSystemSettings(): Promise<void> {
    console.log('[CoreMigrationService] Initializing system settings...');
    
    const defaultSettings = [
      {
        key: 'api_rate_limits',
        value: { requests_per_minute: 60, burst_limit: 100 },
        description: 'API rate limiting configuration'
      },
      {
        key: 'quote_templates',
        value: {
          default_validity_days: 30,
          auto_numbering: true,
          pdf_settings: { format: 'A4', margin: 20 }
        },
        description: 'Quote generation templates and settings'
      },
      {
        key: 'notification_settings',
        value: {
          email_enabled: true,
          webhook_enabled: false,
          admin_alerts: true
        },
        description: 'System notification preferences'
      }
    ];

    for (const setting of defaultSettings) {
      const { data: existing } = await supabase
        .from('system_settings')
        .select('id')
        .eq('key', setting.key)
        .single();

      if (!existing) {
        await supabase.from('system_settings').insert(setting);
        console.log(`[CoreMigrationService] Created system setting: ${setting.key}`);
      }
    }
  }
}
