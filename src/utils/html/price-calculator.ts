
import { ComponentOption } from "@/types/component";

// Função para calcular o valor total da cotação
export function calculateQuoteTotal(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {}
): number {
  let total = 0;

  // Adicionar componentes padrão
  Object.values(selectedComponents)
    .filter(component => component && component.price !== undefined && !['DataCenter', 'Contrato', 'Armazenamento'].includes(component.type))
    .forEach(component => {
      total += component.price || 0;
    });

  // Deduplicar discos internos antes de calcular
  const uniqueInternalDisks = deduplicateStorageItems(storageItems.internal);
  
  // Usar apenas os discos deduplificados para calcular o preço
  uniqueInternalDisks.forEach(disk => {
    if (disk && disk.price) {
      total += disk.price;
    }
  });

  // Adicionar armazenamento externo
  const uniqueExternalStorage = deduplicateStorageItems(storageItems.external);
  uniqueExternalStorage.forEach(disk => {
    if (disk && disk.price) {
      total += disk.price;
    }
  });

  // Adicionar conectividade
  Object.values(connectivityItems).forEach(item => {
    if (item && item.option && item.option.price) {
      total += item.option.price * item.quantity;
    }
  });

  // Adicionar serviços personalizados
  customServices.forEach(service => {
    if (service && service.price) {
      total += service.price;
    }
  });

  // Aplicar margem
  if (margin > 0) {
    total = total * (1 + (margin / 100));
  }

  return total;
}

// Função melhorada para deduplicar itens de armazenamento baseado em tipo e capacidade
export function deduplicateStorageItems(items: ComponentOption[]): ComponentOption[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }
  
  // Inicializa um mapa vazio para armazenar itens únicos
  const uniqueMap: { [key: string]: ComponentOption } = {};
  
  // Usa apenas os discos com preço maior que zero
  items.filter(item => item && item.price > 0).forEach(item => {
    // Cria uma chave única baseada no tipo e capacidade
    const key = createDiskUniqueKey(item);
    
    // Se a chave for válida, armazena o item mais recente com esta chave
    if (key) {
      uniqueMap[key] = item;
    }
  });
  
  return Object.values(uniqueMap);
}

// Função auxiliar para criar uma chave única para um disco com base em tipo e capacidade
export function createDiskUniqueKey(item: ComponentOption): string {
  if (!item) return '';
  
  // Extrai tipo e capacidade do ID do disco interno
  if (item.id && item.id.startsWith('internal-disk-')) {
    const parts = item.id.replace('internal-disk-', '').split('-');
    if (parts.length >= 2) {
      return `${parts[0]}-${parts[1]}`;
    }
  }
  
  // Extrai tipo e capacidade do ID do storage externo
  if (item.id && item.id.startsWith('external-storage-')) {
    const parts = item.id.replace('external-storage-', '').split('-');
    if (parts.length >= 2) {
      return `external-${parts[0]}-${parts[1]}`;
    }
  }
  
  // Tenta extrair do nome como fallback
  if (item.name) {
    const nameParts = item.name.split(' ');
    if (nameParts.length >= 2) {
      const type = nameParts[0].toLowerCase();
      const capacity = nameParts[1].toLowerCase();
      return `${type}-${capacity}`;
    }
  }
  
  // Se não conseguiu extrair informações suficientes, usa o ID como chave final
  return item.id || '';
}
