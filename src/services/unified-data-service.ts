
import { supabase } from '@/lib/supabase';
import { Category, Item, ChangeLog, DataVersion } from '@/types/database';
import { toast } from '@/utils/toast-utils';

export class UnifiedDataService {
  
  // Categories CRUD
  static async getCategories(): Promise<Category[]> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Erro ao carregar categorias');
      return [];
    }
  }

  static async createCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([category])
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Categoria criada com sucesso');
      return data;
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('Erro ao criar categoria');
      return null;
    }
  }

  static async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Categoria atualizada com sucesso');
      return data;
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Erro ao atualizar categoria');
      return null;
    }
  }

  static async deleteCategory(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Categoria excluída com sucesso');
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Erro ao excluir categoria');
      return false;
    }
  }

  // Items CRUD
  static async getItems(categoryId?: string): Promise<Item[]> {
    try {
      let query = supabase
        .from('items')
        .select('*')
        .eq('active', true);
      
      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }
      
      const { data, error } = await query.order('display_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching items:', error);
      toast.error('Erro ao carregar itens');
      return [];
    }
  }

  static async createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item | null> {
    try {
      const { data, error } = await supabase
        .from('items')
        .insert([item])
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Item criado com sucesso');
      return data;
    } catch (error) {
      console.error('Error creating item:', error);
      toast.error('Erro ao criar item');
      return null;
    }
  }

  static async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
    try {
      const { data, error } = await supabase
        .from('items')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      toast.success('Item atualizado com sucesso');
      return data;
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('Erro ao atualizar item');
      return null;
    }
  }

  static async deleteItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      toast.success('Item excluído com sucesso');
      return true;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Erro ao excluir item');
      return false;
    }
  }

  // Reordering
  static async reorderCategories(categories: { id: string; display_order: number }[]): Promise<boolean> {
    try {
      const updates = categories.map(cat => 
        supabase
          .from('categories')
          .update({ display_order: cat.display_order })
          .eq('id', cat.id)
      );
      
      await Promise.all(updates);
      toast.success('Ordem das categorias atualizada');
      return true;
    } catch (error) {
      console.error('Error reordering categories:', error);
      toast.error('Erro ao reordenar categorias');
      return false;
    }
  }

  static async reorderItems(items: { id: string; display_order: number }[]): Promise<boolean> {
    try {
      const updates = items.map(item => 
        supabase
          .from('items')
          .update({ display_order: item.display_order })
          .eq('id', item.id)
      );
      
      await Promise.all(updates);
      toast.success('Ordem dos itens atualizada');
      return true;
    } catch (error) {
      console.error('Error reordering items:', error);
      toast.error('Erro ao reordenar itens');
      return false;
    }
  }

  // Versioning and Change Log
  static async getChangeLog(limit: number = 50): Promise<ChangeLog[]> {
    try {
      const { data, error } = await supabase
        .from('change_log')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching change log:', error);
      return [];
    }
  }

  static async createSnapshot(versionName: string, description?: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('create_data_snapshot', {
        p_version_name: versionName,
        p_description: description
      });
      
      if (error) throw error;
      toast.success('Snapshot criado com sucesso');
      return data;
    } catch (error) {
      console.error('Error creating snapshot:', error);
      toast.error('Erro ao criar snapshot');
      return null;
    }
  }

  static async getVersions(): Promise<DataVersion[]> {
    try {
      const { data, error } = await supabase
        .from('data_versions')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching versions:', error);
      return [];
    }
  }

  // Real-time subscriptions
  static subscribeToCategories(callback: (payload: any) => void) {
    return supabase
      .channel('categories-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'categories' }, 
        callback
      )
      .subscribe();
  }

  static subscribeToItems(callback: (payload: any) => void) {
    return supabase
      .channel('items-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'items' }, 
        callback
      )
      .subscribe();
  }

  static subscribeToChangeLog(callback: (payload: any) => void) {
    return supabase
      .channel('changelog-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'change_log' }, 
        callback
      )
      .subscribe();
  }
}
