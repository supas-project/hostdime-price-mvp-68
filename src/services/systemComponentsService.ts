import { supabase } from '@/integrations/supabase/client';
import { dataMigrationService } from './data-migration-service';

export interface SystemComponent {
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

export class SystemComponentsService {
  static supabase = supabase;

  // Função para buscar todos os componentes
  static async getComponents(): Promise<SystemComponent[]> {
    console.log('[SystemComponentsService] Buscando todos os componentes...');
    const { data, error } = await supabase
      .from('system_components')
      .select('*')
      .eq('is_active', true)
      .order('component_type', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('[SystemComponentsService] Erro ao buscar componentes:', error);
      throw error;
    }

    // Convert Json fields to proper types
    const typedData = (data || []).map(item => ({
      ...item,
      specs: Array.isArray(item.specs) ? item.specs as string[] : [],
      metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {}
    }));

    return typedData;
  }

  // FUNÇÃO MODIFICADA COM LOGS
  static async getOrInitializeAllComponents(): Promise<SystemComponent[]> {
    console.log('[DEBUG] PASSO A: Iniciando getOrInitializeAllComponents...');
    
    // 1. Tenta buscar os componentes existentes
    console.log('[DEBUG] PASSO B: Tentando buscar dados de "system_components"...');
    let { data: components, error: fetchError } = await supabase
      .from('system_components')
      .select('*');

    if (fetchError) {
      console.error('[DEBUG] ERRO CRÍTICO no PASSO B:', fetchError);
      throw fetchError;
    }
    console.log('[DEBUG] PASSO C: Resposta do Supabase recebida. Dados:', components);

    // 2. Verifica se o banco de dados está vazio
    if (components && components.length === 0) {
      console.log('[DEBUG] PASSO D: O banco de dados está vazio. Tentando migração automática...');
      try {
        // 3. Executa a migração
        await dataMigrationService.runCompleteMigration();
        console.log('[DEBUG] PASSO E: Migração automática concluída com sucesso.');

        // 4. Busca os dados novamente
        console.log('[DEBUG] PASSO F: Buscando dados novamente pós-migração...');
        let { data: populatedComponents, error: postMigrationError } = await supabase
          .from('system_components')
          .select('*');
        
        if (postMigrationError) {
          console.error('[DEBUG] ERRO CRÍTICO no PASSO F:', postMigrationError);
          throw postMigrationError;
        }
        
        console.log('[DEBUG] PASSO G: Dados encontrados pós-migração:', populatedComponents);
        
        // Convert Json fields to proper types
        const typedData = (populatedComponents || []).map(item => ({
          ...item,
          specs: Array.isArray(item.specs) ? item.specs as string[] : [],
          metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {}
        }));
        
        return typedData;

      } catch (migrationError) {
        console.error('[DEBUG] ERRO CRÍTICO no PASSO E (Migração):', migrationError);
        throw migrationError;
      }
    }

    // 5. Se os dados já existiam, apenas os retorna
    console.log(`[DEBUG] PASSO H: Fim da função. Retornando ${components?.length || 0} componentes existentes.`);
    
    // Convert Json fields to proper types
    const typedData = (components || []).map(item => ({
      ...item,
      specs: Array.isArray(item.specs) ? item.specs as string[] : [],
      metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {}
    }));
    
    return typedData;
  }

  // Função para adicionar componente
  static async addComponent(newComponentData: Omit<SystemComponent, 'id' | 'created_at' | 'updated_at'>): Promise<SystemComponent> {
    console.log('[SystemComponentsService] Adding new component to system_components:', newComponentData.name);
    
    try {
      const { data, error } = await supabase
        .from('system_components')
        .insert([{
          ...newComponentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('[SystemComponentsService] Error adding component:', error);
        throw new Error(`Não foi possível adicionar o novo item: ${error.message}`);
      }

      console.log('[SystemComponentsService] Component added successfully:', data.id);
      
      // Convert Json fields to proper types
      const typedData = {
        ...data,
        specs: Array.isArray(data.specs) ? data.specs as string[] : [],
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {}
      };
      
      return typedData;
    } catch (error) {
      console.error('[SystemComponentsService] Error in addComponent:', error);
      throw error;
    }
  }

  static async updateComponent(id: string, updates: Partial<SystemComponent>): Promise<SystemComponent> {
    console.log('[SystemComponentsService] Updating component:', id);
    
    try {
      const { data, error } = await supabase
        .from('system_components')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('[SystemComponentsService] Error updating component:', error);
        throw new Error(`Failed to update component: ${error.message}`);
      }

      console.log('[SystemComponentsService] Component updated successfully');
      
      // Convert Json fields to proper types
      const typedData = {
        ...data,
        specs: Array.isArray(data.specs) ? data.specs as string[] : [],
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {}
      };
      
      return typedData;
    } catch (error) {
      console.error('[SystemComponentsService] Error in updateComponent:', error);
      throw error;
    }
  }

  static async deleteComponent(id: string): Promise<void> {
    console.log('[SystemComponentsService] Deleting component:', id);
    
    try {
      const { error } = await supabase
        .from('system_components')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('[SystemComponentsService] Error deleting component:', error);
        throw new Error(`Failed to delete component: ${error.message}`);
      }

      console.log('[SystemComponentsService] Component deleted successfully');
    } catch (error) {
      console.error('[SystemComponentsService] Error in deleteComponent:', error);
      throw error;
    }
  }
}

// Export instance for easier access
export const systemComponentsService = SystemComponentsService;
