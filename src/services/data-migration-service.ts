
import { supabase } from '@/integrations/supabase/client';
import { PricingTableService } from './pricing-table-service';

// Importar dados estáticos existentes
import { cpuComponents } from '@/data/cpu-components';
import { memoryComponents } from '@/data/memory-components';
import { osComponents } from '@/data/os-components';
import { connectivityComponents } from '@/data/connectivity-components';
import { dataCenterComponents } from '@/data/datacenter-components';
import { contractComponents } from '@/data/contract-components';

export class DataMigrationService {
  /**
   * Migra todos os dados das configurações para a tabela de preços
   */
  static async migrateAllDataToPricingTable(): Promise<void> {
    console.log('[DataMigrationService] Iniciando migração de dados para tabela de preços...');
    
    try {
      // Primeiro, garantir que as categorias básicas existem
      await PricingTableService.ensureBasicCategories();
      
      // Migrar cada tipo de componente
      await this.migrateComponentType('cpu', cpuComponents.options);
      await this.migrateComponentType('memory', memoryComponents.options);
      await this.migrateComponentType('os', osComponents.options);
      await this.migrateComponentType('connectivity', connectivityComponents.options);
      await this.migrateComponentType('datacenter', dataCenterComponents.options);
      await this.migrateComponentType('contract', contractComponents.options);
      
      console.log('[DataMigrationService] Migração completa realizada com sucesso');
    } catch (error) {
      console.error('[DataMigrationService] Erro na migração:', error);
      throw error;
    }
  }

  /**
   * Migra um tipo específico de componente
   */
  private static async migrateComponentType(componentType: string, options: any[]): Promise<void> {
    console.log(`[DataMigrationService] Migrando ${componentType}...`);
    
    // Buscar categoria correspondente
    const category = await PricingTableService.getCategoryByType(componentType);
    if (!category) {
      console.warn(`Categoria ${componentType} não encontrada`);
      return;
    }

    let migratedCount = 0;
    let updatedCount = 0;

    for (const option of options) {
      try {
        const componentId = option.id;
        const existingItem = await PricingTableService.getItemByComponentId(componentId);

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
          display_order: 0,
          is_active: true
        };

        if (existingItem) {
          // Atualizar item existente
          await PricingTableService.updateItem(existingItem.id, itemData);
          updatedCount++;
          console.log(`[DataMigrationService] Item atualizado: ${componentId}`);
        } else {
          // Criar novo item
          await PricingTableService.createItem(itemData);
          migratedCount++;
          console.log(`[DataMigrationService] Item criado: ${componentId}`);
        }
      } catch (error) {
        console.error(`[DataMigrationService] Erro ao migrar item ${option.id}:`, error);
      }
    }

    console.log(`[DataMigrationService] ${componentType}: ${migratedCount} criados, ${updatedCount} atualizados`);
  }

  /**
   * Verifica o status da migração
   */
  static async checkMigrationStatus(): Promise<{
    totalCategories: number;
    totalItems: number;
    itemsByCategory: Record<string, number>;
  }> {
    try {
      const categories = await PricingTableService.getAllCategories();
      let totalItems = 0;
      const itemsByCategory: Record<string, number> = {};

      for (const category of categories) {
        const items = await PricingTableService.getItemsByCategory(category.id);
        itemsByCategory[category.component_type] = items.length;
        totalItems += items.length;
      }

      return {
        totalCategories: categories.length,
        totalItems,
        itemsByCategory
      };
    } catch (error) {
      console.error('[DataMigrationService] Erro ao verificar status:', error);
      return {
        totalCategories: 0,
        totalItems: 0,
        itemsByCategory: {}
      };
    }
  }
}
