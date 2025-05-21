
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
  console.log("[Price Calc] Iniciando cálculo de cotação");

  // Adicionar componentes padrão
  Object.values(selectedComponents)
    .filter(component => component && component.price !== undefined && !['DataCenter', 'Contrato', 'Armazenamento'].includes(component.type))
    .forEach(component => {
      total += component.price || 0;
      console.log(`[Price Calc] Componente ${component.name}: ${component.price}`);
    });

  // CORREÇÃO: Sempre deduplica discos antes de calcular
  const uniqueInternalDisks = deduplicateStorageItems(storageItems.internal);
  const uniqueExternalStorage = deduplicateStorageItems(storageItems.external);
  
  // Logar quantidades para debug
  console.log(`[Price Calc] Discos internos originais: ${storageItems.internal.length}, únicos: ${uniqueInternalDisks.length}`);
  console.log(`[Price Calc] Storages externos originais: ${storageItems.external.length}, únicos: ${uniqueExternalStorage.length}`);
  
  // Calcular preço dos discos internos (deduplificados)
  uniqueInternalDisks.forEach(disk => {
    if (disk && disk.price) {
      total += disk.price;
      console.log(`[Price Calc] Disco ${disk.name}: ${disk.price}`);
    }
  });
  
  // Calcular preço do storage externo (deduplificado)
  uniqueExternalStorage.forEach(storage => {
    if (storage && storage.price) {
      total += storage.price;
      console.log(`[Price Calc] Storage ${storage.name}: ${storage.price}`);
    }
  });

  // Adicionar conectividade
  Object.values(connectivityItems).forEach(item => {
    if (item && item.option && item.option.price) {
      const itemTotal = item.option.price * item.quantity;
      total += itemTotal;
      console.log(`[Price Calc] Conectividade ${item.option.name}: ${itemTotal} (${item.quantity}x ${item.option.price})`);
    }
  });

  // Adicionar serviços personalizados
  customServices.forEach(service => {
    if (service && service.price) {
      total += service.price;
      console.log(`[Price Calc] Serviço ${service.name}: ${service.price}`);
    }
  });

  // Aplicar margem
  if (margin > 0) {
    const baseTotal = total;
    total = total * (1 + (margin / 100));
    console.log(`[Price Calc] Aplicando margem de ${margin}%: ${baseTotal} -> ${total}`);
  }

  console.log(`[Price Calc] Total final: ${total}`);
  return total;
}

// CORREÇÃO: Função melhorada para deduplicar itens de armazenamento baseado em tipo e capacidade
export function deduplicateStorageItems(items: ComponentOption[]): ComponentOption[] {
  if (!items || !Array.isArray(items)) {
    console.log("[Dedupe] Array de itens inválido, retornando array vazio");
    return [];
  }
  
  // Filtra itens inválidos e com preço zero (removidos)
  const validItems = items.filter(item => item && item.price > 0);
  
  // Se não houver itens válidos, retorna array vazio
  if (validItems.length === 0) {
    return [];
  }
  
  // Inicializa um mapa vazio para armazenar itens únicos
  const uniqueMap: { [key: string]: ComponentOption } = {};
  
  // Para cada item, gera uma chave única e armazena no mapa
  validItems.forEach(item => {
    // Cria uma chave única baseada no tipo e capacidade
    const key = createDiskUniqueKey(item);
    
    // Se a chave for válida, armazena o item mais recente com esta chave
    if (key) {
      uniqueMap[key] = item;
      console.log(`[Dedupe] Item com chave ${key} adicionado/atualizado: ${item.id}`);
    } else {
      console.warn(`[Dedupe] Não foi possível gerar chave para: ${item.id || 'desconhecido'}`);
    }
  });
  
  // Converte o mapa de volta para um array
  const uniqueItems = Object.values(uniqueMap);
  console.log(`[Dedupe] Itens originais: ${items.length}, itens válidos: ${validItems.length}, itens únicos: ${uniqueItems.length}`);
  
  return uniqueItems;
}

// Função melhorada para criar uma chave única para um disco com base em tipo e capacidade
export function createDiskUniqueKey(item: ComponentOption): string {
  if (!item) return '';
  
  // Extrai tipo e capacidade do ID do disco interno
  if (item.id && item.id.startsWith('internal-disk-')) {
    const parts = item.id.replace('internal-disk-', '').split('-');
    if (parts.length >= 2) {
      const key = `${parts[0]}-${parts[1]}`;
      console.log(`[Key Gen] Chave gerada para disco interno: ${key}`);
      return key;
    }
  }
  
  // Extrai tipo e capacidade do ID do storage externo
  if (item.id && item.id.startsWith('external-storage-')) {
    const parts = item.id.replace('external-storage-', '').split('-');
    if (parts.length >= 2) {
      const key = `external-${parts[0]}-${parts[1]}`;
      console.log(`[Key Gen] Chave gerada para storage externo: ${key}`);
      return key;
    }
  }
  
  // Tenta extrair do nome como fallback
  if (item.name) {
    const nameParts = item.name.split(' ');
    if (nameParts.length >= 2) {
      const type = nameParts[0].toLowerCase();
      const capacity = nameParts[1].toLowerCase();
      const key = `${type}-${capacity}`;
      console.log(`[Key Gen] Chave gerada a partir do nome: ${key}`);
      return key;
    }
  }
  
  // Se não conseguiu extrair informações suficientes, usa o ID como chave final
  console.log(`[Key Gen] Usando ID como chave: ${item.id || 'indefinido'}`);
  return item.id || '';
}
