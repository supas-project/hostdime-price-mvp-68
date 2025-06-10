import { useState, useEffect } from 'react';
import { PricingTableService, ComponentCategory, ComponentItem, PriceModifier } from '@/services/pricing-table-service';
import { DataMigrationService } from '@/services/data-migration-service';
import { toast } from 'sonner';

export function usePricingTable() {
  const [categories, setCategories] = useState<ComponentCategory[]>([]);
  const [items, setItems] = useState<ComponentItem[]>([]);
  const [priceModifiers, setPriceModifiers] = useState<PriceModifier[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialSyncCompleted, setInitialSyncCompleted] = useState(false);

  // Carregar todas as categorias
  const loadCategories = async () => {
    try {
      setLoading(true);
      console.log('🔄 Carregando categorias...');
      const data = await PricingTableService.getAllCategories();
      setCategories(data);
      console.log(`✅ ${data.length} categorias carregadas`);
    } catch (error) {
      console.error('❌ Erro ao carregar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  // Carregar itens por categoria
  const loadItemsByCategory = async (categoryId: string) => {
    try {
      setLoading(true);
      console.log(`🔄 Carregando itens da categoria ${categoryId}...`);
      const data = await PricingTableService.getItemsByCategory(categoryId);
      setItems(data);
      console.log(`✅ ${data.length} itens carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar itens:', error);
      toast.error('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  // Carregar itens por tipo
  const loadItemsByType = async (componentType: string) => {
    try {
      setLoading(true);
      console.log(`🔄 Carregando itens do tipo ${componentType}...`);
      const data = await PricingTableService.getItemsByType(componentType);
      setItems(data);
      console.log(`✅ ${data.length} itens carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar itens por tipo:', error);
      toast.error('Erro ao carregar itens');
    } finally {
      setLoading(false);
    }
  };

  // Carregar modificadores de preço
  const loadPriceModifiers = async () => {
    try {
      console.log('🔄 Carregando modificadores de preço...');
      const data = await PricingTableService.getAllPriceModifiers();
      setPriceModifiers(data);
      console.log(`✅ ${data.length} modificadores carregados`);
    } catch (error) {
      console.error('❌ Erro ao carregar modificadores:', error);
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
      console.error('❌ Erro ao criar categoria:', error);
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
      console.error('❌ Erro ao atualizar categoria:', error);
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
      console.error('❌ Erro ao excluir categoria:', error);
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
      console.error('❌ Erro ao criar item:', error);
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
      console.error('❌ Erro ao atualizar item:', error);
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
      console.error('❌ Erro ao excluir item:', error);
      toast.error('Erro ao excluir item');
    } finally {
      setLoading(false);
    }
  };

  // Função para executar migração direta dos dados estáticos
  const executeDirectMigration = async () => {
    try {
      setLoading(true);
      console.log('🔄 Executando migração direta dos dados estáticos...');
      
      // Executar migração direta usando o serviço
      await DirectMigrationService.executeFullMigration();
      
      // Aguardar um momento e recarregar categorias
      await new Promise(resolve => setTimeout(resolve, 2000));
      await loadCategories();
      
      setInitialSyncCompleted(true);
      toast.success('Migração direta executada com sucesso!');
      console.log('✅ Migração direta concluída');
    } catch (error) {
      console.error('❌ Erro na migração direta:', error);
      toast.error(`Erro na migração direta: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  // Sincronizar com dados estáticos usando o novo serviço
  const syncWithStaticData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Iniciando sincronização com dados estáticos...');
      
      // Usar o novo serviço de migração
      await DataMigrationService.migrateAllDataToPricingTable();
      
      // Aguardar um momento e recarregar dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadCategories();
      
      setInitialSyncCompleted(true);
      toast.success('Sincronização completa realizada com sucesso');
      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      // Se falhar, tentar migração direta
      console.log('🔄 Tentando migração direta como fallback...');
      await executeDirectMigration();
    } finally {
      setLoading(false);
    }
  };

  // Verificação e sincronização inicial mais robusta
  const performInitialSync = async () => {
    try {
      console.log('🔍 Verificando se sincronização inicial é necessária...');
      
      // Carregar categorias diretamente para verificar
      await loadCategories();
      
      // Se não há categorias, executar migração direta
      const currentCategories = await PricingTableService.getAllCategories();
      
      if (currentCategories.length === 0) {
        console.log('📦 Nenhuma categoria encontrada. Executando migração direta...');
        await executeDirectMigration();
      } else {
        console.log(`✅ Sistema já inicializado: ${currentCategories.length} categorias encontradas`);
        setCategories(currentCategories);
        setInitialSyncCompleted(true);
      }
    } catch (error) {
      console.error('❌ Erro na sincronização inicial:', error);
      // Tentar migração direta como último recurso
      await executeDirectMigration();
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const initializeData = async () => {
      console.log('🔍 Inicializando dados da tabela de preços...');
      await loadCategories();
      await loadPriceModifiers();
      
      // Verificar se há categorias, se não houver, marcar para sync
      const currentCategories = await PricingTableService.getAllCategories();
      if (currentCategories.length === 0) {
        console.log('⚠️ Nenhuma categoria encontrada, sync necessário');
        setInitialSyncCompleted(false);
      } else {
        console.log(`✅ ${currentCategories.length} categorias encontradas`);
        setInitialSyncCompleted(true);
      }
    };
    
    initializeData();
  }, []);

  return {
    // Estados
    categories,
    items,
    priceModifiers,
    loading,
    initialSyncCompleted,

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
    syncWithStaticData,
    executeDirectMigration
  };
}
