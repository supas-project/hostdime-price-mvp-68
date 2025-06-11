import { supabase } from '@/integrations/supabase/client';

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

export interface DataCenter {
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

export interface ContractType {
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

export class SystemComponentsService {
  static supabase = supabase;

  static async getComponentsByType(componentType: string): Promise<SystemComponent[]> {
    console.log(`[SystemComponentsService] Getting components for type: ${componentType}`);
    
    try {
      const { data, error } = await supabase
        .from('system_components')
        .select('*')
        .eq('component_type', componentType)
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error(`[SystemComponentsService] Error fetching ${componentType} components:`, error);
        throw new Error(`Failed to fetch ${componentType} components: ${error.message}`);
      }

      console.log(`[SystemComponentsService] Found ${data?.length || 0} ${componentType} components`);
      
      // Convert Json fields to proper types
      const typedData = (data || []).map(item => ({
        ...item,
        specs: Array.isArray(item.specs) ? item.specs as string[] : [],
        metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {}
      }));
      
      return typedData;
    } catch (error) {
      console.error(`[SystemComponentsService] Error in getComponentsByType:`, error);
      throw error;
    }
  }

  static async getAllDataCenters(): Promise<DataCenter[]> {
    console.log('[SystemComponentsService] Getting all data centers');
    
    try {
      const { data, error } = await supabase
        .from('datacenters')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('[SystemComponentsService] Error fetching data centers:', error);
        throw new Error(`Failed to fetch data centers: ${error.message}`);
      }

      console.log(`[SystemComponentsService] Found ${data?.length || 0} data centers`);
      
      // Convert Json fields to proper types
      const typedData = (data || []).map(item => ({
        ...item,
        features: Array.isArray(item.features) ? item.features as string[] : [],
        certifications: Array.isArray(item.certifications) ? item.certifications as string[] : []
      }));
      
      return typedData;
    } catch (error) {
      console.error('[SystemComponentsService] Error in getAllDataCenters:', error);
      throw error;
    }
  }

  static async getAllContractTypes(): Promise<ContractType[]> {
    console.log('[SystemComponentsService] Getting all contract types');
    
    try {
      const { data, error } = await supabase
        .from('contract_types')
        .select('*')
        .eq('is_active', true)
        .order('duration_months');

      if (error) {
        console.error('[SystemComponentsService] Error fetching contract types:', error);
        throw new Error(`Failed to fetch contract types: ${error.message}`);
      }

      console.log(`[SystemComponentsService] Found ${data?.length || 0} contract types`);
      return data || [];
    } catch (error) {
      console.error('[SystemComponentsService] Error in getAllContractTypes:', error);
      throw error;
    }
  }

  static async createComponent(component: Omit<SystemComponent, 'id' | 'created_at' | 'updated_at'>): Promise<SystemComponent> {
    console.log('[SystemComponentsService] Creating new component:', component.name);
    
    try {
      const { data, error } = await supabase
        .from('system_components')
        .insert(component)
        .select()
        .single();

      if (error) {
        console.error('[SystemComponentsService] Error creating component:', error);
        throw new Error(`Failed to create component: ${error.message}`);
      }

      console.log('[SystemComponentsService] Component created successfully:', data.id);
      
      // Convert Json fields to proper types
      const typedData = {
        ...data,
        specs: Array.isArray(data.specs) ? data.specs as string[] : [],
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {}
      };
      
      return typedData;
    } catch (error) {
      console.error('[SystemComponentsService] Error in createComponent:', error);
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

  /**
   * Adiciona um novo componente à tabela hd_hardwares
   * @param newComponentData - Dados do novo componente (sem id e created_at)
   * @returns Promise com o componente criado
   */
  static async addComponent(newComponentData: Omit<SystemComponent, 'id' | 'created_at' | 'updated_at'>): Promise<SystemComponent> {
    console.log('[SystemComponentsService] Adding new component to hd_hardwares:', newComponentData.name);
    
    try {
      const { data, error } = await supabase
        .from('hd_hardwares')
        .insert([{
          ...newComponentData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) {
        console.error('[SystemComponentsService] Error adding component to hd_hardwares:', error);
        throw new Error(`Não foi possível adicionar o novo item: ${error.message}`);
      }

      console.log('[SystemComponentsService] Component added successfully to hd_hardwares:', data.id);
      
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

  /**
   * Atualiza um componente existente na tabela hd_hardwares
   * @param componentId - ID do componente a ser atualizado
   * @param updatedData - Dados a serem atualizados
   * @returns Promise com o componente atualizado
   */
  static async updateComponentInHardwares(componentId: string, updatedData: Partial<SystemComponent>): Promise<SystemComponent> {
    console.log('[SystemComponentsService] Updating component in hd_hardwares:', componentId);
    
    try {
      const { data, error } = await supabase
        .from('hd_hardwares')
        .update({ 
          ...updatedData, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', componentId)
        .select()
        .single();

      if (error) {
        console.error('[SystemComponentsService] Error updating component in hd_hardwares:', error);
        throw new Error(`Não foi possível atualizar o componente: ${error.message}`);
      }

      console.log('[SystemComponentsService] Component updated successfully in hd_hardwares');
      
      // Convert Json fields to proper types
      const typedData = {
        ...data,
        specs: Array.isArray(data.specs) ? data.specs as string[] : [],
        metadata: typeof data.metadata === 'object' ? data.metadata as Record<string, any> : {}
      };
      
      return typedData;
    } catch (error) {
      console.error('[SystemComponentsService] Error in updateComponentInHardwares:', error);
      throw error;
    }
  }

  /**
   * Remove um componente da tabela hd_hardwares (soft delete)
   * @param componentId - ID do componente a ser removido
   * @returns Promise<void>
   */
  static async deleteComponentFromHardwares(componentId: string): Promise<void> {
    console.log('[SystemComponentsService] Deleting component from hd_hardwares:', componentId);
    
    try {
      const { error } = await supabase
        .from('hd_hardwares')
        .update({ 
          is_active: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', componentId);

      if (error) {
        console.error('[SystemComponentsService] Error deleting component from hd_hardwares:', error);
        throw new Error(`Não foi possível remover o componente: ${error.message}`);
      }

      console.log('[SystemComponentsService] Component deleted successfully from hd_hardwares');
    } catch (error) {
      console.error('[SystemComponentsService] Error in deleteComponentFromHardwares:', error);
      throw error;
    }
  }

  /**
   * Busca todos os componentes da tabela hd_hardwares
   * @returns Promise com array de componentes
   */
  static async getAllComponents(): Promise<SystemComponent[]> {
    console.log('[SystemComponentsService] Getting all components from hd_hardwares');
    
    try {
      const { data, error } = await supabase
        .from('hd_hardwares')
        .select('*')
        .eq('is_active', true)
        .order('component_type', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        console.error('[SystemComponentsService] Error fetching components from hd_hardwares:', error);
        throw new Error(`Failed to fetch components: ${error.message}`);
      }

      console.log(`[SystemComponentsService] Found ${data?.length || 0} components in hd_hardwares`);
      
      // Convert Json fields to proper types
      const typedData = (data || []).map(item => ({
        ...item,
        specs: Array.isArray(item.specs) ? item.specs as string[] : [],
        metadata: typeof item.metadata === 'object' ? item.metadata as Record<string, any> : {}
      }));
      
      return typedData;
    } catch (error) {
      console.error('[SystemComponentsService] Error in getAllComponents:', error);
      throw error;
    }
  }
}

// Export instance for easier access
export const systemComponentsService = SystemComponentsService;
