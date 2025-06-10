
import { supabase } from '@/lib/supabase';
import { Category, Item, ChangeLog } from '@/types/database';
import { toast } from '@/utils/toast-utils';

export class UnifiedDataService {
  // Category operations
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
      return [];
    }
  }

  static async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .insert(categoryData);
      
      if (error) throw error;
      
      toast.success('Categoria criada com sucesso');
      return true;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Erro ao criar categoria');
      return false;
    }
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Categoria atualizada com sucesso');
      return true;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
      return false;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Categoria removida com sucesso');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao remover categoria');
      return false;
    }
  }

  // Item operations
  static async getItems(): Promise<Item[]> {
    try {
      const { data, error } = await supabase
        .from('items')
        .select(`
          *,
          category:categories(name)
        `)
        .order('name');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Erro ao carregar itens');
      return [];
    }
  }

  static async createItem(itemData: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('items')
        .insert(itemData);
      
      if (error) throw error;
      
      toast.success('Item criado com sucesso');
      return true;
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Erro ao criar item');
      return false;
    }
  }

  static async updateItem(id: string, updates: Partial<Item>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Item atualizado com sucesso');
      return true;
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar item');
      return false;
    }
  }

  static async deleteItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Item removido com sucesso');
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao remover item');
      return false;
    }
  }

  // Change log operations
  static async getChangeLog(): Promise<ChangeLog[]> {
    try {
      const { data, error } = await supabase
        .from('change_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching change log:', error);
      return [];
    }
  }

  // Legacy compatibility methods - these methods are kept for backward compatibility
  // but they now work with the new unified data structure
  static async getComponentsByType(type: string): Promise<any[]> {
    console.log(`Legacy getComponentsByType called with type: ${type}`);
    // Convert items to legacy format if needed
    const items = await this.getItems();
    return items.filter(item => item.category_id?.includes(type.toLowerCase()) || false);
  }

  static async getAllStorageItems(): Promise<any[]> {
    console.log('Legacy getAllStorageItems called');
    const items = await this.getItems();
    return items.filter(item => item.name.toLowerCase().includes('storage') || item.name.toLowerCase().includes('disk'));
  }

  static async getAllDataCenters(): Promise<any[]> {
    console.log('Legacy getAllDataCenters called');
    const items = await this.getItems();
    return items.filter(item => item.name.toLowerCase().includes('datacenter') || item.name.toLowerCase().includes('data center'));
  }

  static async getAllContractTypes(): Promise<any[]> {
    console.log('Legacy getAllContractTypes called');
    const items = await this.getItems();
    return items.filter(item => item.name.toLowerCase().includes('contract') || item.name.toLowerCase().includes('contrato'));
  }

  static async getConsolidationStatus(): Promise<any> {
    console.log('Legacy getConsolidationStatus called');
    return {
      phase: 'completed',
      components_count: 0,
      datacenters_count: 0,
      contracts_count: 0,
      storage_count: 0,
      errors: []
    };
  }

  static async consolidateAllData(): Promise<boolean> {
    console.log('Legacy consolidateAllData called');
    return true;
  }
}
