
import { PricingTableService } from './pricing-table-service';
import { ComponentDataAdapter } from './componentDataAdapter';
import { ComponentOption } from '@/types/component';

/**
 * Serviço responsável pela sincronização entre a tabela de preços
 * e o sistema de configurações
 */
export class PricingSyncService {
  
  /**
   * Converte dados da tabela de preços para ComponentOption[]
   * para uso no sistema de configurações
   */
  static async getComponentOptionsFromPricingTable(componentType: string): Promise<ComponentOption[]> {
    try {
      console.log(`[PricingSyncService] Carregando componentes do tipo: ${componentType}`);
      
      const items = await PricingTableService.getItemsByType(componentType);
      
      const componentOptions: ComponentOption[] = items.map(item => ({
        id: item.component_id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        type: componentType,
        subtype: item.subtype,
        isHardware: item.is_hardware,
        specs: Array.isArray(item.specs) ? item.specs : [],
        metadata: item.metadata || {}
      }));

      console.log(`[PricingSyncService] Convertidos ${componentOptions.length} itens para ComponentOption`);
      return componentOptions;
      
    } catch (error) {
      console.error(`[PricingSyncService] Erro ao carregar componentes do tipo ${componentType}:`, error);
      return [];
    }
  }

  /**
   * Atualiza um item na tabela de preços baseado em mudanças
   * no sistema de configurações
   */
  static async updatePricingFromConfiguration(componentId: string, updates: Partial<ComponentOption>): Promise<void> {
    try {
      const existingItem = await PricingTableService.getItemByComponentId(componentId);
      
      if (!existingItem) {
        console.warn(`[PricingSyncService] Item não encontrado na tabela de preços: ${componentId}`);
        return;
      }

      const itemUpdates = {
        name: updates.name || existingItem.name,
        description: updates.description || existingItem.description,
        price: updates.price !== undefined ? updates.price : existingItem.price,
        base_price: updates.price !== undefined ? updates.price : existingItem.base_price,
        subtype: updates.subtype || existingItem.subtype,
        is_hardware: updates.isHardware !== undefined ? updates.isHardware : existingItem.is_hardware,
        specs: Array.isArray(updates.specs) ? updates.specs : existingItem.specs,
        metadata: updates.metadata || existingItem.metadata
      };

      await PricingTableService.updateItem(existingItem.id, itemUpdates);
      console.log(`[PricingSyncService] Item atualizado na tabela de preços: ${componentId}`);
      
    } catch (error) {
      console.error(`[PricingSyncService] Erro ao atualizar item na tabela de preços:`, error);
      throw error;
    }
  }

  /**
   * Sincroniza todos os componentes dos dados estáticos para a tabela de preços
   */
  static async syncAllFromStaticData(): Promise<void> {
    try {
      console.log('[PricingSyncService] Iniciando sincronização completa...');
      await PricingTableService.syncAllComponentsFromStaticData();
      console.log('[PricingSyncService] Sincronização completa finalizada');
    } catch (error) {
      console.error('[PricingSyncService] Erro na sincronização completa:', error);
      throw error;
    }
  }

  /**
   * Verifica se a tabela de preços está sincronizada com os dados estáticos
   */
  static async checkSyncStatus(): Promise<{
    isInSync: boolean;
    missingComponents: string[];
    outdatedComponents: string[];
  }> {
    try {
      // Importar dados estáticos para comparação
      const { cpuComponents } = await import('@/data/cpu-components');
      const { memoryComponents } = await import('@/data/memory-components');
      const { osComponents } = await import('@/data/os-components');
      
      const staticComponents = [
        ...cpuComponents.options.map(opt => ({ ...opt, type: 'cpu' })),
        ...memoryComponents.options.map(opt => ({ ...opt, type: 'memory' })),
        ...osComponents.options.map(opt => ({ ...opt, type: 'os' }))
      ];

      const missingComponents: string[] = [];
      const outdatedComponents: string[] = [];

      // Verificar cada componente estático
      for (const staticComponent of staticComponents) {
        const dbItem = await PricingTableService.getItemByComponentId(staticComponent.id);
        
        if (!dbItem) {
          missingComponents.push(staticComponent.id);
        } else if (dbItem.price !== staticComponent.price || dbItem.name !== staticComponent.name) {
          outdatedComponents.push(staticComponent.id);
        }
      }

      const isInSync = missingComponents.length === 0 && outdatedComponents.length === 0;
      
      return {
        isInSync,
        missingComponents,
        outdatedComponents
      };
      
    } catch (error) {
      console.error('[PricingSyncService] Erro ao verificar status de sincronização:', error);
      return {
        isInSync: false,
        missingComponents: [],
        outdatedComponents: []
      };
    }
  }
}
