
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
  
  // CORREÇÃO: Usar um mapa para agrupar por nome normalizado
  const uniqueMap: { [key: string]: ComponentOption } = {};
  
  // Para cada item, gera uma chave única e armazena no mapa
  validItems.forEach(item => {
    // CORREÇÃO: Usar estratégias múltiplas para gerar chaves únicas
    const keys = generatePossibleKeys(item);
    
    // Usar a primeira chave válida que encontrarmos
    if (keys.length > 0) {
      const key = keys[0];
      uniqueMap[key] = item;
      console.log(`[Dedupe] Item com chave ${key} adicionado/atualizado: ${item.id}`);
    } else {
      // Último recurso: usar o ID como chave
      uniqueMap[item.id] = item;
      console.warn(`[Dedupe] Usando ID como chave de fallback: ${item.id}`);
    }
  });
  
  // Converte o mapa de volta para um array
  const uniqueItems = Object.values(uniqueMap);
  console.log(`[Dedupe] Itens originais: ${items.length}, itens válidos: ${validItems.length}, itens únicos: ${uniqueItems.length}`);
  
  return uniqueItems;
}

// CORREÇÃO: Função expandida para gerar múltiplas possíveis chaves para um item de armazenamento
function generatePossibleKeys(item: ComponentOption): string[] {
  if (!item) return [];
  
  const keys: string[] = [];
  
  // 1. Tenta extrair do ID para discos internos
  if (item.id && item.id.startsWith('internal-disk-')) {
    const parts = item.id.replace('internal-disk-', '').split('-');
    if (parts.length >= 2) {
      keys.push(`internal-${parts[0]}-${parts[1]}`);
    }
  }
  
  // 2. Tenta extrair do ID para storage externo
  if (item.id && item.id.startsWith('external-storage-')) {
    const parts = item.id.replace('external-storage-', '').split('-');
    if (parts.length >= 2) {
      keys.push(`external-${parts[0]}-${parts[1]}`);
    }
  }
  
  // 3. Tenta extrair do nome e tipo - Método mais consistente para SSD 5000GB
  if (item.name) {
    const nameNormalized = item.name.toLowerCase().trim();
    const subtype = item.subtype?.toLowerCase() || '';
    
    // Encontra números seguidos de GB ou TB
    const capacityMatches = nameNormalized.match(/(\d+)\s*(gb|tb)/i);
    if (capacityMatches) {
      const capacity = capacityMatches[1];
      const unit = capacityMatches[2]?.toUpperCase() || '';
      
      // Primeira chave: tipo + capacidade
      if (subtype && capacity) {
        keys.push(`${subtype}-${capacity}${unit}`);
      }
      
      // Segunda chave: nome em camelCase
      const typeMatch = nameNormalized.match(/^(ssd|hdd|nvme)/i);
      if (typeMatch) {
        const type = typeMatch[1].toLowerCase();
        keys.push(`${type}-${capacity}${unit}`);
      }
    }
  }
  
  // 4. Tenta extrair de specs
  if (item.specs && item.specs.length > 0) {
    // Procura por capacidade nas specs
    const capacitySpec = item.specs.find(spec => spec.toLowerCase().includes('capacidade:'));
    const typeSpec = item.specs.find(spec => spec.toLowerCase().includes('tipo:'));
    
    if (capacitySpec && typeSpec) {
      const capacity = capacitySpec.split(':')[1]?.trim().replace(/\s+/g, '');
      const type = typeSpec.split(':')[1]?.trim().toLowerCase();
      
      if (capacity && type) {
        keys.push(`${type}-${capacity}`);
      }
    }
  }
  
  // 5. Constrói uma chave a partir do nome normalizado - chave mais genérica
  if (item.name) {
    const normalized = item.name
      .toLowerCase()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/[^a-z0-9\-]/g, ''); // Remove caracteres não alfanuméricos
    
    keys.push(normalized);
  }
  
  // Garante que não temos chaves vazias
  return keys.filter(key => key && key.length > 0);
}

// Função de compatibilidade mantida para código existente
export function createDiskUniqueKey(item: ComponentOption): string {
  const keys = generatePossibleKeys(item);
  return keys.length > 0 ? keys[0] : (item.id || '');
}
