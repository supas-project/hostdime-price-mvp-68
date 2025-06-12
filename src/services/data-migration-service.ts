import { SystemComponentsService } from './systemComponentsService';
import { cpuComponents } from '@/data/cpu-components';
import { memoryComponents } from '@/data/memory-components';
import { osComponents } from '@/data/os-components';
import { connectivityComponents } from '@/data/connectivity-components';
import { dataCenterComponents } from '@/data/datacenter-components';
import { contractComponents } from '@/data/contract-components';
import { ComponentOption } from '@/types/component';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for migrating static data to the database
 */
export class DataMigrationService {
  /**
   * Migrates all CPU components to the database
   */
  static async migrateCPUComponents(): Promise<void> {
    console.log('[DataMigrationService] Starting CPU migration...');
    
    try {
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
          
          console.log(`[DataMigrationService] Created CPU component: ${component.name}`);
        }
      }
    } catch (error) {
      console.error('[DataMigrationService] Error migrating CPU components:', error);
      throw error;
    }
  }

  /**
   * Migrates all memory components to the database
   */
  static async migrateMemoryComponents(): Promise<void> {
    console.log('[DataMigrationService] Starting memory migration...');
    
    try {
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
          
          console.log(`[DataMigrationService] Created memory component: ${component.name}`);
        }
      }
    } catch (error) {
      console.error('[DataMigrationService] Error migrating memory components:', error);
      throw error;
    }
  }

  /**
   * Migrates all OS components to the database
   */
  static async migrateOSComponents(): Promise<void> {
    console.log('[DataMigrationService] Starting OS migration...');
    
    try {
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
          
          console.log(`[DataMigrationService] Created OS component: ${component.name}`);
        }
      }
    } catch (error) {
      console.error('[DataMigrationService] Error migrating OS components:', error);
      throw error;
    }
  }

  /**
   * Migrates all connectivity components to the database
   */
  static async migrateConnectivityComponents(): Promise<void> {
    console.log('[DataMigrationService] Starting connectivity migration...');
    
    try {
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
          
          console.log(`[DataMigrationService] Created connectivity component: ${component.name}`);
        }
      }
    } catch (error) {
      console.error('[DataMigrationService] Error migrating connectivity components:', error);
      throw error;
    }
  }

  /**
   * Migrates data centers to the database
   */
  static async migrateDataCenters(): Promise<void> {
    console.log('[DataMigrationService] Starting data centers migration...');
    
    try {
      const { supabase } = SystemComponentsService;
      
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
          
          console.log(`[DataMigrationService] Created data center: ${dc.name}`);
        }
      }
    } catch (error) {
      console.error('[DataMigrationService] Error migrating data centers:', error);
      throw error;
    }
  }

  /**
   * Migrates contract types to the database
   */
  static async migrateContractTypes(): Promise<void> {
    console.log('[DataMigrationService] Starting contract types migration...');
    
    try {
      const { supabase } = SystemComponentsService;
      
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
          
          console.log(`[DataMigrationService] Created contract type: ${contract.name}`);
        }
      }
    } catch (error) {
      console.error('[DataMigrationService] Error migrating contract types:', error);
      throw error;
    }
  }

  /**
   * Gets all static components from data files with robust validation
   */
  static getAllStaticComponents() {
    console.log("[MIGRAÇÃO-360] Lendo todos os componentes estáticos...");
    
    const allComponents = [];
    
    // Add CPU components
    cpuComponents.options.forEach(component => {
      allComponents.push({
        component_type: 'cpu',
        component_id: component.id,
        name: component.name || 'Nome Indefinido',
        description: component.description || '',
        price: component.price || 0,
        subtype: component.subtype,
        is_hardware: component.isHardware || true,
        is_active: true,
        specs: component.specs || [],
        metadata: component.metadata || {}
      });
    });

    // Add memory components
    memoryComponents.options.forEach(component => {
      allComponents.push({
        component_type: 'memory',
        component_id: component.id,
        name: component.name || 'Nome Indefinido',
        description: component.description || '',
        price: component.price || 0,
        subtype: component.subtype,
        is_hardware: component.isHardware || true,
        is_active: true,
        specs: component.specs || [],
        metadata: component.metadata || {}
      });
    });

    // Add OS components
    osComponents.options.forEach(component => {
      allComponents.push({
        component_type: 'operating_system',
        component_id: component.id,
        name: component.name || 'Nome Indefinido',
        description: component.description || '',
        price: component.price || 0,
        subtype: component.subtype,
        is_hardware: component.isHardware || false,
        is_active: true,
        specs: component.specs || [],
        metadata: component.metadata || {}
      });
    });

    // Add connectivity components
    connectivityComponents.options.forEach(component => {
      allComponents.push({
        component_type: 'connectivity',
        component_id: component.id,
        name: component.name || 'Nome Indefinido',
        description: component.description || '',
        price: component.price || 0,
        subtype: component.subtype,
        is_hardware: component.isHardware || false,
        is_active: true,
        specs: component.specs || [],
        metadata: component.metadata || {}
      });
    });

    console.log(`[MIGRAÇÃO-360] Total de componentes processados: ${allComponents.length}`);
    
    // GARANTE QUE CADA COMPONENTE TENHA OS CAMPOS NECESSÁRIOS
    const validatedComponents = allComponents.map(comp => {
      const baseComponent = {
        component_type: comp.component_type || 'outros',
        component_id: comp.component_id || `comp-${Date.now()}`,
        name: comp.name || 'Nome Indefinido',
        description: comp.description || '',
        price: comp.price || 0,
        subtype: comp.subtype || '',
        is_hardware: comp.is_hardware !== undefined ? comp.is_hardware : false,
        is_active: true,
        specs: Array.isArray(comp.specs) ? comp.specs : [],
        metadata: typeof comp.metadata === 'object' ? comp.metadata : {}
      };
      
      console.log(`[MIGRAÇÃO-360] Processando componente: ${baseComponent.name}, Tipo: ${baseComponent.component_type}`);
      return baseComponent;
    });

    console.log(`[MIGRAÇÃO-360] Componentes validados: ${validatedComponents.length}`);
    return validatedComponents;
  }

  /**
   * Runs complete migration of all static data
   */
  static async runCompleteMigration() {
    console.log('[MIGRAÇÃO-FINAL] PASSO 1: Iniciando a migração completa...');
    
    const staticComponents = this.getAllStaticComponents();
    console.log(`[MIGRAÇÃO-FINAL] PASSO 2: Encontrados ${staticComponents.length} componentes estáticos no total.`);
    
    // LOG PARA VER A ESTRUTURA DOS DADOS QUE SERÃO INSERIDOS
    console.log('[MIGRAÇÃO-FINAL] PASSO 3: Amostra do primeiro item a ser inserido:', staticComponents[0]);
    
    if (staticComponents.length === 0) {
      console.warn('[MIGRAÇÃO-FINAL] Nenhum componente para migrar.');
      return;
    }

    // A operação de inserção crítica
    const { data, error } = await supabase
      .from('system_components')
      .insert(staticComponents)
      .select(); // .select() é crucial para vermos o resultado

    if (error) {
      console.error('[MIGRAÇÃO-FINAL] ERRO CRÍTICO AO INSERIR:', {
        message: error.message,
        details: error.details,
        code: error.code,
      });
      throw new Error(`A migração falhou: ${error.message}`);
    }

    console.log(`[MIGRAÇÃO-FINAL] PASSO 4: Migração finalizada. ${data?.length || 0} linhas foram inseridas com sucesso.`);
    console.log('[MIGRAÇÃO-FINAL] Amostra da primeira linha inserida:', data?.[0]);
  }

  /**
   * Checks if migration is needed by counting existing data
   */
  static async checkMigrationStatus(): Promise<{
    needed: boolean;
    summary: string;
  }> {
    try {
      const { supabase } = SystemComponentsService;
      
      const [cpuCount, memoryCount, osCount, connectivityCount, dcCount, contractCount] = await Promise.all([
        supabase.from('system_components').select('id', { count: 'exact' }).eq('component_type', 'cpu'),
        supabase.from('system_components').select('id', { count: 'exact' }).eq('component_type', 'memory'),
        supabase.from('system_components').select('id', { count: 'exact' }).eq('component_type', 'os'),
        supabase.from('system_components').select('id', { count: 'exact' }).eq('component_type', 'connectivity'),
        supabase.from('datacenters').select('id', { count: 'exact' }),
        supabase.from('contract_types').select('id', { count: 'exact' })
      ]);

      const totalComponents = (cpuCount.count || 0) + (memoryCount.count || 0) + 
                            (osCount.count || 0) + (connectivityCount.count || 0) + 
                            (dcCount.count || 0) + (contractCount.count || 0);

      const needed = totalComponents === 0;
      const summary = `Banco: ${cpuCount.count || 0} CPUs, ${memoryCount.count || 0} RAM, ${osCount.count || 0} OS, ${connectivityCount.count || 0} conectividade, ${dcCount.count || 0} DCs, ${contractCount.count || 0} contratos`;

      return { needed, summary };
    } catch (error) {
      console.error('[DataMigrationService] Error checking migration status:', error);
      return { needed: true, summary: 'Erro ao verificar status' };
    }
  }
}

// Export instance for easier access
export const dataMigrationService = DataMigrationService;
