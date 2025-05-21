
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
  storageItems.external.forEach(disk => {
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

// Função auxiliar para deduplicar itens de armazenamento baseado em tipo e capacidade
function deduplicateStorageItems(items: ComponentOption[]): ComponentOption[] {
  const uniqueMap: { [key: string]: ComponentOption } = {};
  
  // Usa apenas os discos com preço maior que zero
  items.filter(item => item && item.price > 0).forEach(item => {
    // Extrai informações do nome ou id para criar uma chave única
    let diskType = '';
    let capacity = '';
    
    if (item.id.includes('internal-disk-')) {
      // Extrair do ID interno-disk-tipo-capacidade
      const parts = item.id.replace('internal-disk-', '').split('-');
      diskType = parts[0];
      capacity = parts[1];
    } else {
      // Tentar extrair do nome (fallback)
      const nameParts = item.name.split(' ');
      if (nameParts.length >= 2) {
        diskType = nameParts[0].toLowerCase();
        capacity = nameParts[1];
      }
    }
    
    const key = `${diskType}-${capacity}`;
    uniqueMap[key] = item;
  });
  
  return Object.values(uniqueMap);
}
