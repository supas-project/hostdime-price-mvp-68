
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
      return data || [];
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
      return data || [];
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
      return data;
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
      return data;
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
