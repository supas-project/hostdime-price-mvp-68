
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/utils/number-formatter";
import { deduplicateStorageItems } from "../html/price-calculator";

// Função para gerar linhas HTML para componentes padrão
export function generateComponentsRows(selectedComponents: { [key: string]: ComponentOption }): string {
  let rows = '';
  
  Object.values(selectedComponents)
    .filter(component => {
      // CORREÇÃO: Garantir que não renderizamos DataCenter e Contrato aqui (são renderizados separadamente)
      // Verificar tanto pelo tipo original quanto pelo tipo em lowercase
      const type = component?.type?.toLowerCase();
      return component && 
             component.price !== undefined && 
             type !== 'datacenter' &&
             type !== 'contrato' &&
             type !== 'armazenamento';
    })
    .forEach(component => {
      const price = formatCurrency(component.price || 0);
      
      let specsHtml = '';
      if (component.specs && component.specs.length > 0) {
        specsHtml = '<div class="specs-list"><ul>';
        component.specs.forEach(spec => {
          specsHtml += `<li><span class="check-icon">✓</span><span class="editable-field" contenteditable="true" data-field="spec-${component.id}">${spec}</span></li>`;
        });
        specsHtml += '</ul></div>';
      }
      
      // NOVA LÓGICA: Adicionar informações especiais para licenciamento Windows Server
      if (component.metadata?.perCore && component.type.toLowerCase().includes('sistema')) {
        const unitPrice = component.metadata?.unitPrice || (component.price / Math.ceil((component.metadata?.cores || 1) / 2));
        specsHtml = specsHtml || '<div class="specs-list"><ul>';
        if (!specsHtml.includes('</ul>')) {
          specsHtml = specsHtml.replace('</ul></div>', '');
        }
        specsHtml += `<li><span class="check-icon">✓</span> Preço base por licença: <span class="editable-field" contenteditable="true" data-field="unit-price-${component.id}">R$ ${unitPrice.toFixed(2)}</span></li>`;
        specsHtml += '</ul></div>';
      }
      
      rows += `
        <tr>
          <td><span class="editable-field" contenteditable="true" data-field="type-${component.id}">${component.type}</span></td>
          <td>
            <span class="component-name editable-field" contenteditable="true" data-field="name-${component.id}">${component.name}</span>
            ${component.description ? `<div class="component-description"><span class="editable-field" contenteditable="true" data-field="desc-${component.id}">${component.description}</span></div>` : ''}
            ${specsHtml}
          </td>
          <td class="text-right"><span class="editable-field" contenteditable="true" data-field="price-${component.id}">${price}</span></td>
        </tr>
      `;
    });
  
  return rows;
}

// CORREÇÃO: Deduplica os itens de armazenamento antes de gerar as linhas HTML
export function generateStorageRows(
  internalDisks: ComponentOption[],
  externalStorage: ComponentOption[]
): string {
  let rows = '';
  
  // CORREÇÃO: Deduplica os discos internos
  const uniqueInternalDisks = deduplicateStorageItems(internalDisks);
  
  // CORREÇÃO: Processamos os discos internos, agrupando-os por tipo
  const groupedDisks = groupStorageItemsByType(uniqueInternalDisks);
  
  // Gera linhas para cada tipo de disco interno (mostrando a quantidade)
  Object.entries(groupedDisks).forEach(([type, items]) => {
    items.forEach(item => {
      const price = formatCurrency(item.price || 0);
      const quantity = item.metadata?.quantity || 1;
      
      // Extrair especificações para mostrar como lista
      let specsHtml = '<div class="specs-list"><ul>';
      
      // Adiciona informações de tipo/capacidade/quantidade como specs
      specsHtml += `<li><span class="check-icon">✓</span> Tipo: <span class="editable-field" contenteditable="true" data-field="storage-type-${item.id}">${item.subtype || type.toUpperCase()}</span></li>`;
      
      // Extrair capacidade do nome ou specs
      let capacity = "N/A";
      if (item.specs) {
        const capacitySpec = item.specs.find(spec => spec.toLowerCase().includes('capacidade:'));
        if (capacitySpec) {
          capacity = capacitySpec.split(':')[1]?.trim();
        }
      }
      
      specsHtml += `<li><span class="check-icon">✓</span> Capacidade: <span class="editable-field" contenteditable="true" data-field="storage-capacity-${item.id}">${capacity}</span></li>`;
      specsHtml += `<li><span class="check-icon">✓</span> Quantidade: <span class="editable-field" contenteditable="true" data-field="storage-quantity-${item.id}">${quantity}</span></li>`;
      
      // MODIFICAÇÃO: Adicionar informações de RAID quando disponíveis
      if (item.metadata?.raid && item.metadata.raid.type !== 'none') {
        specsHtml += `<li><span class="check-icon">✓</span> RAID: <span class="editable-field" contenteditable="true" data-field="raid-type-${item.id}">RAID ${item.metadata.raid.type}</span></li>`;
        specsHtml += `<li><span class="check-icon">✓</span> Tipo RAID: <span class="editable-field" contenteditable="true" data-field="raid-hardware-${item.id}">${item.metadata.raid.isHardware ? 'Hardware' : 'Software'}</span></li>`;
        specsHtml += `<li><span class="check-icon">✓</span> Proteção: <span class="editable-field" contenteditable="true" data-field="raid-protection-${item.id}">${item.metadata.raid.protection}</span></li>`;
      }
      
      specsHtml += '</ul></div>';
      
      rows += `
        <tr>
          <td><span class="editable-field" contenteditable="true" data-field="storage-internal-type">Armazenamento interno</span></td>
          <td>
            <span class="component-name editable-field" contenteditable="true" data-field="storage-name-${item.id}">${item.name}</span>
            <div class="component-description"><span class="editable-field" contenteditable="true" data-field="storage-desc-${item.id}">Disco interno: ${item.name}</span></div>
            ${specsHtml}
          </td>
          <td class="text-right"><span class="editable-field" contenteditable="true" data-field="storage-price-${item.id}">${price}</span></td>
        </tr>
      `;
    });
  });

  // CORREÇÃO: Deduplica o storage externo
  const uniqueExternalStorage = deduplicateStorageItems(externalStorage);
  
  // Gera linhas para o storage externo
  uniqueExternalStorage.forEach(storage => {
    const price = formatCurrency(storage.price || 0);
    
    // Extrai especificações para mostrar como lista
    let specsHtml = '';
    if (storage.specs && storage.specs.length > 0) {
      specsHtml = '<div class="specs-list"><ul>';
      storage.specs.forEach(spec => {
        specsHtml += `<li><span class="check-icon">✓</span><span class="editable-field" contenteditable="true" data-field="external-spec-${storage.id}">${spec}</span></li>`;
      });
      specsHtml += '</ul></div>';
    }
    
    rows += `
      <tr>
        <td><span class="editable-field" contenteditable="true" data-field="storage-external-type">Armazenamento externo</span></td>
        <td>
          <span class="component-name editable-field" contenteditable="true" data-field="external-name-${storage.id}">${storage.name}</span>
          ${storage.description ? `<div class="component-description"><span class="editable-field" contenteditable="true" data-field="external-desc-${storage.id}">${storage.description}</span></div>` : ''}
          ${specsHtml}
        </td>
        <td class="text-right"><span class="editable-field" contenteditable="true" data-field="external-price-${storage.id}">${price}</span></td>
      </tr>
    `;
  });
  
  return rows;
}

// CORREÇÃO: Nova função para agrupar itens de armazenamento por tipo
function groupStorageItemsByType(items: ComponentOption[]): Record<string, ComponentOption[]> {
  return items.reduce((groups, item) => {
    // Extrair o tipo do disco (HDD, SSD, etc) do subtipo ou do nome
    const type = (item.subtype || item.name.split(' ')[0]).toLowerCase();
    
    if (!groups[type]) {
      groups[type] = [];
    }
    
    groups[type].push(item);
    return groups;
  }, {} as Record<string, ComponentOption[]>);
}

// Função para gerar linhas HTML para itens de conectividade
export function generateConnectivityRows(connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } }): string {
  let rows = '';
  
  Object.values(connectivityItems).forEach(item => {
    if (!item || !item.option) return;
    
    const price = formatCurrency((item.option.price || 0) * item.quantity);
    const component = item.option;
    
    let specsHtml = '';
    if (component.specs && component.specs.length > 0) {
      specsHtml = '<div class="specs-list"><ul>';
      component.specs.forEach(spec => {
        specsHtml += `<li><span class="check-icon">✓</span><span class="editable-field" contenteditable="true" data-field="connectivity-spec-${component.id}">${spec}</span></li>`;
      });
      specsHtml += '</ul></div>';
    }
    
    // Adicionar quantidade como spec se for maior que 1
    if (item.quantity > 1) {
      if (!specsHtml) {
        specsHtml = '<div class="specs-list"><ul>';
      } else {
        specsHtml = specsHtml.replace('</ul></div>', '');
      }
      specsHtml += `<li><span class="check-icon">✓</span> Quantidade: <span class="editable-field" contenteditable="true" data-field="connectivity-quantity-${component.id}">${item.quantity}</span></li></ul></div>`;
    }
    
    rows += `
      <tr>
        <td><span class="editable-field" contenteditable="true" data-field="connectivity-type">Conectividade</span></td>
        <td>
          <span class="component-name editable-field" contenteditable="true" data-field="connectivity-name-${component.id}">${component.name}</span>
          ${component.description ? `<div class="component-description"><span class="editable-field" contenteditable="true" data-field="connectivity-desc-${component.id}">${component.description}</span></div>` : ''}
          ${specsHtml}
        </td>
        <td class="text-right"><span class="editable-field" contenteditable="true" data-field="connectivity-price-${component.id}">${price}</span></td>
      </tr>
    `;
  });
  
  return rows;
}

// Função para gerar linhas HTML para serviços personalizados
export function generateCustomServicesRows(customServices: ComponentOption[]): string {
  let rows = '';
  
  customServices.forEach(service => {
    const price = formatCurrency(service.price || 0);
    
    let specsHtml = '';
    if (service.specs && service.specs.length > 0) {
      specsHtml = '<div class="specs-list"><ul>';
      service.specs.forEach(spec => {
        specsHtml += `<li><span class="check-icon">✓</span><span class="editable-field" contenteditable="true" data-field="service-spec-${service.id}">${spec}</span></li>`;
      });
      specsHtml += '</ul></div>';
    }
    
    rows += `
      <tr>
        <td><span class="editable-field" contenteditable="true" data-field="service-type">Serviço Adicional</span></td>
        <td>
          <span class="component-name editable-field" contenteditable="true" data-field="service-name-${service.id}">${service.name}</span>
          ${service.description ? `<div class="component-description"><span class="editable-field" contenteditable="true" data-field="service-desc-${service.id}">${service.description}</span></div>` : ''}
          ${specsHtml}
        </td>
        <td class="text-right"><span class="editable-field" contenteditable="true" data-field="service-price-${service.id}">${price}</span></td>
      </tr>
    `;
  });
  
  return rows;
}
