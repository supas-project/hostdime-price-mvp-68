
import { useState, useEffect } from 'react';
import { PricingTableService, ComponentCategory, ComponentItem, PriceModifier } from '@/services/pricing-table-service';
import { toast } from 'sonner';

export function usePricingTable() {
  const [categories, setCategories] = useState<ComponentCategory[]>([]);
  const [items, setItems] = useState<ComponentItem[]>([]);
  const [priceModifiers, setPriceModifiers] = useState<PriceModifier[]>([]);
  const [loading, setLoading] = useState(false);

  // Carregar todas as categorias
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await PricingTableService.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  // Carregar itens por categoria
  const loadItemsByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      const data = await PricingTableService.getItemsByCategory(categoryId);
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  // Carregar itens por tipo
  const loadItemsByType = async (componentType: string) => {
    try {
      setLoading(true);
      const data = await PricingTableService.getItemsByType(componentType);
      setItems(data);
    } catch (error) {
      console.error('Erro ao carregar itens por tipo:', error);
      toast.error('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  // Carregar modificadores de preço
  const loadPriceModifiers = async () => {
    try {
      const data = await PricingTableService.getAllPriceModifiers();
      setPriceModifiers(data);
    } catch (error) {
      console.error('Erro ao carregar modificadores:', error);
      toast.error('Erro ao carregar modificadores de preço');
    }
  };

  // Criar categoria
  const createCategory = async (categoryData: Omit<ComponentCategory, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    try {
      setLoading(true);
      await PricingTableService.createCategory(categoryData);
      await loadCategories(); // Recarregar lista
      toast.success('Categoria criada com sucesso');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast.error('Erro ao criar categoria');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar categoria
  const updateCategory = async (id: string, updates: Partial<ComponentCategory>) => {
    try {
      setLoading(true);
      await PricingTableService.updateCategory(id, updates);
      await loadCategories(); // Recarregar lista
      toast.success('Categoria atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast.error('Erro ao atualizar categoria');
    } finally {
      setLoading(false);
    }
  };

  // Excluir categoria
  const deleteCategory = async (id: string) => {
    try {
      setLoading(true);
      await PricingTableService.deleteCategory(id);
      await loadCategories(); // Recarregar lista
      toast.success('Categoria excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      toast.error('Erro ao excluir categoria');
    } finally {
      setLoading(false);
    }
  };

  // Criar item
  const createItem = async (itemData: Omit<ComponentItem, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by'>) => {
    try {
      setLoading(true);
      await PricingTableService.createItem(itemData);
      await loadItemsByCategory(itemData.category_id); // Recarregar lista
      toast.success('Item criado com sucesso');
    } catch (error) {
      console.error('Erro ao criar item:', error);
      toast.error('Erro ao criar item');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar item
  const updateItem = async (id: string, updates: Partial<ComponentItem>) => {
    try {
      setLoading(true);
      await PricingTableService.updateItem(id, updates);
      // Recarregar itens da categoria atual
      const item = items.find(i => i.id === id);
      if (item) {
        await loadItemsByCategory(item.category_id);
      }
      toast.success('Item atualizado com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      toast.error('Erro ao atualizar item');
    } finally {
      setLoading(false);
    }
  };

  // Excluir item
  const deleteItem = async (id: string) => {
    try {
      setLoading(true);
      const item = items.find(i => i.id === id);
      await PricingTableService.deleteItem(id);
      if (item) {
        await loadItemsByCategory(item.category_id); // Recarregar lista
      }
      toast.success('Item excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar com dados estáticos
  const syncWithStaticData = async () => {
    try {
      setLoading(true);
      await PricingTableService.syncAllComponentsFromStaticData();
      await loadCategories();
      toast.success('Sincronização completa realizada com sucesso');
    } catch (error) {
      console.error('Erro na sincronização:', error);
      toast.error('Erro na sincronização com dados estáticos');
    } finally {
      setLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    loadCategories();
    loadPriceModifiers();
  }, []);

  return {
    // Estados
    categories,
    items,
    priceModifiers,
    loading,

    // Ações para categorias
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,

    // Ações para itens
    loadItemsByCategory,
    loadItemsByType,
    createItem,
    updateItem,
    deleteItem,

    // Ações para modificadores
    loadPriceModifiers,

    // Sincronização
    syncWithStaticData
  };
}
