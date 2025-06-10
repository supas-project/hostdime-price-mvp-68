
import { supabase } from '@/integrations/supabase/client';

export interface ComponentCategory {
  id: string;
  name: string;
  description?: string;
  component_type: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface ComponentItem {
  id: string;
  category_id: string;
  component_id: string;
  name: string;
  description?: string;
  price: number;
  base_price: number;
  subtype?: string;
  is_hardware: boolean;
  specs: string[];
  metadata: Record<string, any>;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PriceModifier {
  id: string;
  name: string;
  description?: string;
  modifier_type: 'percentage' | 'fixed' | 'multiplier';
  value: number;
  conditions: Record<string, any>;
  applies_to: string[];
  is_active: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export class PricingTableService {
  // ============ CATEGORIAS ============
  static async getAllCategories(): Promise<ComponentCategory[]> {
    const { data, error } = await supabase
      .from('component_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    return data || [];
  }

  static async getCategoryByType(componentType: string): Promise<ComponentCategory | null> {
    const { data, error } = await supabase
      .from('component_categories')
      .select('*')
      .eq('component_type', componentType)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching category by type:', error);
      throw error;
    }

    return data;
  }

  static async createCategory(category: Omit<ComponentCategory, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<ComponentCategory> {
    const { data, error } = await supabase
      .from('component_categories')
      .insert(category)
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return data;
  }

  static async updateCategory(id: string, updates: Partial<ComponentCategory>): Promise<ComponentCategory> {
    const { data, error } = await supabase
      .from('component_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('component_categories')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // ============ ITENS ============
  static async getItemsByCategory(categoryId: string): Promise<ComponentItem[]> {
    const { data, error } = await supabase
      .from('component_items')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching items by category:', error);
      throw error;
    }

    return data || [];
  }

  static async getItemsByType(componentType: string): Promise<ComponentItem[]> {
    const { data, error } = await supabase
      .from('component_items')
      .select(`
        *,
        component_categories!inner(component_type)
      `)
      .eq('component_categories.component_type', componentType)
      .eq('is_active', true)
      .order('display_order');

    if (error) {
      console.error('Error fetching items by type:', error);
      throw error;
    }

    return data || [];
  }

  static async getItemByComponentId(componentId: string): Promise<ComponentItem | null> {
    const { data, error } = await supabase
      .from('component_items')
      .select('*')
      .eq('component_id', componentId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching item by component ID:', error);
      throw error;
    }

    return data;
  }

  static async createItem(item: Omit<ComponentItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>): Promise<ComponentItem> {
    const { data, error } = await supabase
      .from('component_items')
      .insert(item)
      .select()
      .single();

    if (error) {
      console.error('Error creating item:', error);
      throw error;
    }

    return data;
  }

  static async updateItem(id: string, updates: Partial<ComponentItem>): Promise<ComponentItem> {
    const { data, error } = await supabase
      .from('component_items')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      throw error;
    }

    return data;
  }

  static async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('component_items')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error);
      throw error;
    }
  }

  // ============ MODIFICADORES DE PREÇO ============
  static async getAllPriceModifiers(): Promise<PriceModifier[]> {
    const { data, error } = await supabase
      .from('price_modifiers')
      .select('*')
      .eq('is_active', true)
      .order('priority');

    if (error) {
      console.error('Error fetching price modifiers:', error);
      throw error;
    }

    return data || [];
  }

  static async createPriceModifier(modifier: Omit<PriceModifier, 'id' | 'created_at' | 'updated_at'>): Promise<PriceModifier> {
    const { data, error } = await supabase
      .from('price_modifiers')
      .insert(modifier)
      .select()
      .single();

    if (error) {
      console.error('Error creating price modifier:', error);
      throw error;
    }

    return data;
  }

  static async updatePriceModifier(id: string, updates: Partial<PriceModifier>): Promise<PriceModifier> {
    const { data, error } = await supabase
      .from('price_modifiers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating price modifier:', error);
      throw error;
    }

    return data;
  }

  static async deletePriceModifier(id: string): Promise<void> {
    const { error } = await supabase
      .from('price_modifiers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting price modifier:', error);
      throw error;
    }
  }

  // ============ SINCRONIZAÇÃO ============
  static async syncAllComponentsFromStaticData(): Promise<void> {
    console.log('[PricingTableService] Iniciando sincronização completa...');
    
    // Importar dados estáticos
    const { serverData } = await import('@/data/server-components');
    const { cpuComponents } = await import('@/data/cpu-components');
    const { memoryComponents } = await import('@/data/memory-components');
    const { osComponents } = await import('@/data/os-components');
    const { connectivityComponents } = await import('@/data/connectivity-components');
    const { dataCenterComponents } = await import('@/data/datacenter-components');
    const { contractComponents } = await import('@/data/contract-components');

    try {
      // Sincronizar processadores
      await this.syncComponentType('cpu', cpuComponents.options);
      
      // Sincronizar memória
      await this.syncComponentType('memory', memoryComponents.options);
      
      // Sincronizar sistema operacional
      await this.syncComponentType('os', osComponents.options);
      
      // Sincronizar conectividade
      await this.syncComponentType('connectivity', connectivityComponents.options);
      
      // Sincronizar data centers
      await this.syncComponentType('datacenter', dataCenterComponents.options);
      
      // Sincronizar contratos
      await this.syncComponentType('contract', contractComponents.options);

      console.log('[PricingTableService] Sincronização completa finalizada');
    } catch (error) {
      console.error('[PricingTableService] Erro na sincronização:', error);
      throw error;
    }
  }

  private static async syncComponentType(componentType: string, staticOptions: any[]): Promise<void> {
    console.log(`[PricingTableService] Sincronizando ${componentType}...`);
    
    // Buscar categoria
    let category = await this.getCategoryByType(componentType);
    if (!category) {
      console.warn(`Categoria ${componentType} não encontrada`);
      return;
    }

    // Sincronizar cada item
    for (const option of staticOptions) {
      const componentId = option.id;
      const existingItem = await this.getItemByComponentId(componentId);

      const itemData = {
        category_id: category.id,
        component_id: componentId,
        name: option.name,
        description: option.description || '',
        price: option.price || 0,
        base_price: option.price || 0,
        subtype: option.subtype || 'standard',
        is_hardware: option.isHardware || false,
        specs: Array.isArray(option.specs) ? option.specs : [],
        metadata: option.metadata || {},
        display_order: 0
      };

      if (existingItem) {
        // Atualizar item existente
        await this.updateItem(existingItem.id, itemData);
        console.log(`[PricingTableService] Item atualizado: ${componentId}`);
      } else {
        // Criar novo item
        await this.createItem(itemData);
        console.log(`[PricingTableService] Item criado: ${componentId}`);
      }
    }
  }
}
