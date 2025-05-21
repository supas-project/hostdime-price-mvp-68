
import { useEffect, useState, useCallback } from "react";
import { ComponentOption } from "@/types/component";
import { PriceService } from "@/services/price-service";
import { memoryComponents } from "@/data/memory-components";

export function useComponentOptions(componentType: string) {
  const [options, setOptions] = useState<ComponentOption[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadOptions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let fetchedOptions: ComponentOption[] = [];
      
      // Normalizar tipo de componente para comparação
      const normalizedType = componentType.toLowerCase();
      
      // Mapear tipos para categorias e funções de conversão específicas
      switch (normalizedType) {
        case 'memory':
        case 'memória':
          // Tentar obter dados da tabela de preços primeiro
          const memoryItems = await PriceService.getCategoryItems('memory');
          
          if (memoryItems && memoryItems.length > 0) {
            console.log(`[useComponentOptions] Memória: Encontrados ${memoryItems.length} itens na tabela de preços`);
            
            // Converter itens para formato ComponentOption
            fetchedOptions = memoryItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'memoria',
              isHardware: true,
              specs: item.specs || ["Memória RAM de alta performance"]
            }));
          } else {
            console.log('[useComponentOptions] Memória: Nenhum item encontrado na tabela de preços, usando dados estáticos');
            // Usar dados estáticos como fallback
            fetchedOptions = memoryComponents.options;
          }
          break;
          
        case 'cpu':
        case 'processador':
          const processorItems = await PriceService.getCategoryItems('processor');
          if (processorItems && processorItems.length > 0) {
            console.log(`[useComponentOptions] Processador: Encontrados ${processorItems.length} itens na tabela de preços`);
            fetchedOptions = processorItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'processador',
              isHardware: true,
              specs: item.specs || []
            }));
          } else {
            console.log('[useComponentOptions] Processador: Nenhum item encontrado na tabela de preços');
            fetchedOptions = [];
          }
          break;
          
        case 'datacenter':
          const datacenterItems = await PriceService.getCategoryItems('datacenter');
          if (datacenterItems && datacenterItems.length > 0) {
            console.log(`[useComponentOptions] DataCenter: Encontrados ${datacenterItems.length} itens na tabela de preços`);
            fetchedOptions = datacenterItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'datacenter',
              isHardware: false,
              specs: item.specs || [],
              metadata: {
                features: item.metadata?.features || [],
                // Usar operador de acesso seguro para propriedades que podem não existir
                ...(item.metadata?.location ? { location: item.metadata.location } : {}),
                ...(item.metadata?.badge ? { badge: item.metadata.badge } : {})
              }
            }));
          } else {
            console.log('[useComponentOptions] DataCenter: Nenhum item encontrado na tabela de preços');
            fetchedOptions = [];
          }
          break;
          
        case 'contract':
          const contractItems = await PriceService.getCategoryItems('contract');
          if (contractItems && contractItems.length > 0) {
            console.log(`[useComponentOptions] Contrato: Encontrados ${contractItems.length} itens na tabela de preços`);
            fetchedOptions = contractItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'contract',
              isHardware: false,
              specs: item.specs || []
            }));
          } else {
            console.log('[useComponentOptions] Contrato: Nenhum item encontrado na tabela de preços');
            fetchedOptions = [];
          }
          break;
          
        case 'connectivity':
          const connectivityItems = await PriceService.getCategoryItems('connectivity');
          if (connectivityItems && connectivityItems.length > 0) {
            console.log(`[useComponentOptions] Conectividade: Encontrados ${connectivityItems.length} itens na tabela de preços`);
            fetchedOptions = connectivityItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'connectivity',
              isHardware: false,
              specs: item.specs || []
            }));
          } else {
            console.log('[useComponentOptions] Conectividade: Nenhum item encontrado na tabela de preços');
            fetchedOptions = [];
          }
          break;
          
        case 'armazenamento':
        case 'storage':
          const storageItems = await PriceService.getCategoryItems('storage');
          if (storageItems && storageItems.length > 0) {
            console.log(`[useComponentOptions] Armazenamento: Encontrados ${storageItems.length} itens na tabela de preços`);
            fetchedOptions = storageItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'storage',
              isHardware: true,
              specs: item.specs || []
            }));
          } else {
            console.log('[useComponentOptions] Armazenamento: Nenhum item encontrado na tabela de preços');
            fetchedOptions = [];
          }
          break;
          
        case 'sistemaoperacional':
        case 'os':
          const osItems = await PriceService.getCategoryItems('sistemaoperacional');
          if (osItems && osItems.length > 0) {
            console.log(`[useComponentOptions] Sistema Operacional: Encontrados ${osItems.length} itens na tabela de preços`);
            fetchedOptions = osItems.map(item => ({
              id: item.id,
              name: item.name,
              description: item.description || '',
              price: item.price,
              type: 'os',
              isHardware: false,
              specs: item.specs || []
            }));
          } else {
            console.log('[useComponentOptions] Sistema Operacional: Nenhum item encontrado na tabela de preços');
            fetchedOptions = [];
          }
          break;
          
        default:
          console.log(`[useComponentOptions] Tipo não reconhecido: ${normalizedType}`);
          fetchedOptions = [];
      }
      
      setOptions(fetchedOptions);
    } catch (err) {
      console.error(`[useComponentOptions] Erro ao carregar opções para ${componentType}:`, err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar opções'));
    } finally {
      setIsLoading(false);
    }
  }, [componentType]);

  // Carregar opções na montagem do componente
  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  // Retornar também a função de atualização para uso externo
  return { options, isLoading, error, refreshOptions: loadOptions };
}
