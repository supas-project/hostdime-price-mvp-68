
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
   * Verifica e cria categorias básicas se não existirem
   */
  static async ensureBasicCategoriesExist(): Promise<void> {
    console.log('[DataMigrationService] Verificando categorias básicas...');
    
    const basicCategories = [
      { 
        name: 'Processadores', 
        component_type: 'cpu', 
        display_order: 1, 
        description: 'Processadores e CPUs para servidores' 
      },
      { 
        name: 'Memória RAM', 
        component_type: 'memory', 
        display_order: 2, 
        description: 'Módulos de memória RAM para servidores' 
      },
      { 
        name: 'Sistema Operacional', 
        component_type: 'os', 
        display_order: 3, 
        description: 'Sistemas operacionais e licenças' 
      },
      { 
        name: 'Conectividade', 
        component_type: 'connectivity', 
        display_order: 4, 
        description: 'Opções de conectividade e largura de banda' 
      },
      { 
        name: 'Data Centers', 
        component_type: 'datacenter', 
        display_order: 5, 
        description: 'Localização de data centers' 
      },
      { 
        name: 'Contratos', 
        component_type: 'contract', 
        display_order: 6, 
        description: 'Tipos de contrato e durações' 
      }
    ];

    for (const category of basicCategories) {
      try {
        // Verificar se a categoria já existe
        const { data: existing, error: selectError } = await supabase
          .from('component_categories')
          .select('id')
          .eq('component_type', category.component_type)
          .eq('is_active', true)
          .single();

        if (selectError && selectError.code !== 'PGRST116') {
          console.error(`Erro ao verificar categoria ${category.component_type}:`, selectError);
          continue;
        }

        if (!existing) {
          // Criar categoria
          const { error: insertError } = await supabase
            .from('component_categories')
            .insert({
              name: category.name,
              description: category.description,
              component_type: category.component_type,
              display_order: category.display_order,
              is_active: true
            });

          if (insertError) {
            console.error(`Erro ao criar categoria ${category.component_type}:`, insertError);
          } else {
            console.log(`✅ Categoria criada: ${category.component_type}`);
          }
        } else {
          console.log(`✅ Categoria já existe: ${category.component_type}`);
        }
      } catch (error) {
        console.error(`Erro geral ao processar categoria ${category.component_type}:`, error);
      }
    }
  }

  /**
   * Valida se os dados estáticos estão disponíveis
   */
  static validateStaticData(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar cada fonte de dados
    if (!cpuComponents?.options?.length) {
      errors.push('Dados de CPU não encontrados ou vazios');
    }
    if (!memoryComponents?.options?.length) {
      errors.push('Dados de memória não encontrados ou vazios');
    }
    if (!osComponents?.options?.length) {
      errors.push('Dados de OS não encontrados ou vazios');
    }
    if (!connectivityComponents?.options?.length) {
      errors.push('Dados de conectividade não encontrados ou vazios');
    }
    if (!dataCenterComponents?.options?.length) {
      errors.push('Dados de data center não encontrados ou vazios');
    }
    if (!contractComponents?.options?.length) {
      errors.push('Dados de contrato não encontrados ou vazios');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Migra todos os dados das configurações para a tabela de preços
   */
  static async migrateAllDataToPricingTable(): Promise<void> {
    console.log('[DataMigrationService] 🚀 Iniciando migração completa...');
    
    try {
      // 1. Validar dados estáticos
      const validation = this.validateStaticData();
      if (!validation.isValid) {
        throw new Error(`Dados estáticos inválidos: ${validation.errors.join(', ')}`);
      }
      console.log('✅ Dados estáticos validados');

      // 2. Garantir que as categorias básicas existem
      await this.ensureBasicCategoriesExist();
      console.log('✅ Categorias básicas verificadas/criadas');

      // 3. Aguardar um momento para garantir que as operações anteriores foram concluídas
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 4. Migrar cada tipo de componente com validação
      const migrations = [
        { type: 'cpu', data: cpuComponents.options },
        { type: 'memory', data: memoryComponents.options },
        { type: 'os', data: osComponents.options },
        { type: 'connectivity', data: connectivityComponents.options },
        { type: 'datacenter', data: dataCenterComponents.options },
        { type: 'contract', data: contractComponents.options }
      ];

      for (const migration of migrations) {
        await this.migrateComponentTypeWithValidation(migration.type, migration.data);
      }

      console.log('[DataMigrationService] ✅ Migração completa realizada com sucesso');
    } catch (error) {
      console.error('[DataMigrationService] ❌ Erro na migração:', error);
      throw error;
    }
  }

  /**
   * Migra um tipo específico de componente com validações robustas
   */
  private static async migrateComponentTypeWithValidation(componentType: string, options: any[]): Promise<void> {
    console.log(`[DataMigrationService] 🔄 Migrando ${componentType}... (${options.length} itens)`);
    
    try {
      // 1. Buscar categoria correspondente com retry
      let category = null;
      let retries = 3;
      
      while (!category && retries > 0) {
        const { data: categoryData, error } = await supabase
          .from('component_categories')
          .select('*')
          .eq('component_type', componentType)
          .eq('is_active', true)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error(`Erro ao buscar categoria ${componentType}:`, error);
          retries--;
          if (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        }
        
        category = categoryData;
        break;
      }

      if (!category) {
        throw new Error(`Categoria ${componentType} não encontrada após ${3 - retries} tentativas`);
      }

      console.log(`✅ Categoria ${componentType} encontrada: ${category.id}`);

      let migratedCount = 0;
      let updatedCount = 0;
      let errorCount = 0;

      // 2. Migrar cada item com validação individual
      for (const [index, option] of options.entries()) {
        try {
          if (!option.id || !option.name) {
            console.warn(`Item ${index} inválido em ${componentType}:`, option);
            errorCount++;
            continue;
          }

          const componentId = option.id;
          
          // Verificar se item já existe
          const { data: existingItem, error: selectError } = await supabase
            .from('component_items')
            .select('id')
            .eq('component_id', componentId)
            .eq('is_active', true)
            .single();

          if (selectError && selectError.code !== 'PGRST116') {
            console.error(`Erro ao verificar item ${componentId}:`, selectError);
            errorCount++;
            continue;
          }

          const itemData = {
            category_id: category.id,
            component_id: componentId,
            name: option.name,
            description: option.description || '',
            price: Number(option.price) || 0,
            base_price: Number(option.price) || 0,
            subtype: option.subtype || 'standard',
            is_hardware: Boolean(option.isHardware),
            specs: Array.isArray(option.specs) ? option.specs : [],
            metadata: typeof option.metadata === 'object' ? option.metadata : {},
            display_order: index,
            is_active: true
          };

          if (existingItem) {
            // Atualizar item existente
            const { error: updateError } = await supabase
              .from('component_items')
              .update(itemData)
              .eq('id', existingItem.id);

            if (updateError) {
              console.error(`Erro ao atualizar item ${componentId}:`, updateError);
              errorCount++;
            } else {
              updatedCount++;
              console.log(`✅ Item atualizado: ${componentId}`);
            }
          } else {
            // Criar novo item
            const { error: insertError } = await supabase
              .from('component_items')
              .insert(itemData);

            if (insertError) {
              console.error(`Erro ao criar item ${componentId}:`, insertError);
              errorCount++;
            } else {
              migratedCount++;
              console.log(`✅ Item criado: ${componentId}`);
            }
          }

          // Pequena pausa entre itens para evitar sobrecarga
          if (index % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }

        } catch (error) {
          console.error(`Erro ao processar item ${option.id}:`, error);
          errorCount++;
        }
      }

      console.log(`[DataMigrationService] ${componentType}: ✅ ${migratedCount} criados, ✅ ${updatedCount} atualizados, ❌ ${errorCount} erros`);

    } catch (error) {
      console.error(`[DataMigrationService] Erro crítico ao migrar ${componentType}:`, error);
      throw error;
    }
  }

  /**
   * Verifica o status da migração com validações detalhadas
   */
  static async checkMigrationStatus(): Promise<{
    totalCategories: number;
    totalItems: number;
    itemsByCategory: Record<string, number>;
    isHealthy: boolean;
    errors: string[];
  }> {
    console.log('[DataMigrationService] 🔍 Verificando status da migração...');
    
    try {
      const errors: string[] = [];

      // Verificar categorias
      const { data: categories, error: categoriesError } = await supabase
        .from('component_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (categoriesError) {
        errors.push(`Erro ao carregar categorias: ${categoriesError.message}`);
        console.error('Erro ao carregar categorias:', categoriesError);
      }

      const totalCategories = categories?.length || 0;
      let totalItems = 0;
      const itemsByCategory: Record<string, number> = {};

      // Verificar itens por categoria
      if (categories && categories.length > 0) {
        for (const category of categories) {
          try {
            const { data: items, error: itemsError } = await supabase
              .from('component_items')
              .select('id')
              .eq('category_id', category.id)
              .eq('is_active', true);

            if (itemsError) {
              errors.push(`Erro ao carregar itens da categoria ${category.component_type}: ${itemsError.message}`);
              console.error(`Erro ao carregar itens da categoria ${category.component_type}:`, itemsError);
              itemsByCategory[category.component_type] = 0;
            } else {
              const count = items?.length || 0;
              itemsByCategory[category.component_type] = count;
              totalItems += count;
            }
          } catch (error) {
            console.error(`Erro ao processar categoria ${category.component_type}:`, error);
            errors.push(`Erro ao processar categoria ${category.component_type}`);
          }
        }
      }

      const isHealthy = errors.length === 0 && totalCategories > 0 && totalItems > 0;

      console.log(`[DataMigrationService] Status: ${totalCategories} categorias, ${totalItems} itens, ${isHealthy ? 'saudável' : 'com problemas'}`);

      return {
        totalCategories,
        totalItems,
        itemsByCategory,
        isHealthy,
        errors
      };
    } catch (error) {
      console.error('[DataMigrationService] Erro ao verificar status:', error);
      return {
        totalCategories: 0,
        totalItems: 0,
        itemsByCategory: {},
        isHealthy: false,
        errors: [`Erro crítico: ${error}`]
      };
    }
  }

  /**
   * Limpa todos os dados migrados (útil para reset)
   */
  static async clearMigratedData(): Promise<void> {
    console.log('[DataMigrationService] 🗑️ Limpando dados migrados...');
    
    try {
      // Remover itens
      await supabase
        .from('component_items')
        .update({ is_active: false })
        .eq('is_active', true);

      // Remover categorias
      await supabase
        .from('component_categories')
        .update({ is_active: false })
        .eq('is_active', true);

      console.log('[DataMigrationService] ✅ Dados limpos com sucesso');
    } catch (error) {
      console.error('[DataMigrationService] ❌ Erro ao limpar dados:', error);
      throw error;
    }
  }
}
