
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/utils/number-formatter";
import { deduplicateStorageItems } from "../html/price-calculator";

// Função para gerar linhas HTML para componentes padrão
export function generateComponentsRows(selectedComponents: { [key: string]: ComponentOption }): string {
  let rows = '';
  
  Object.values(selectedComponents)
    .filter(component => component && component.price !== undefined && !['DataCenter', 'Contrato', 'Armazenamento'].includes(component.type))
    .forEach(component => {
      const price = formatCurrency(component.price || 0);
      
      let specsHtml = '';
      if (component.specs && component.specs.length > 0) {
        specsHtml = '<div class="specs-list"><ul>';
        component.specs.forEach(spec => {
          specsHtml += `<li><span class="check-icon">✓</span> ${spec}</li>`;
        });
        specsHtml += '</ul></div>';
      }
      
      rows += `
        <tr>
          <td>${component.type}</td>
          <td>
            <span class="component-name">${component.name}</span>
            ${component.description ? `<div class="component-description">${component.description}</div>` : ''}
            ${specsHtml}
          </td>
          <td class="text-right">${price}</td>
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
      specsHtml += `<li><span class="check-icon">✓</span> Tipo: ${item.subtype || type.toUpperCase()}</li>`;
      
      // Extrair capacidade do nome ou specs
      let capacity = "N/A";
      if (item.specs) {
        const capacitySpec = item.specs.find(spec => spec.toLowerCase().includes('capacidade:'));
        if (capacitySpec) {
          capacity = capacitySpec.split(':')[1]?.trim();
        }
      }
      
      specsHtml += `<li><span class="check-icon">✓</span> Capacidade: ${capacity}</li>`;
      specsHtml += `<li><span class="check-icon">✓</span> Quantidade: ${quantity}</li>`;
      
      // NOVA FUNCIONALIDADE: Adicionar informações de RAID se disponíveis
      if (item.metadata?.raid) {
        const raidInfo = item.metadata.raid;
        
        // Adiciona informações de RAID como specs
        specsHtml += `<li><span class="check-icon">✓</span> RAID: ${raidInfo.type === 'none' ? 'Sem RAID' : `RAID ${raidInfo.type}`}</li>`;
        
        // Adiciona informações adicionais do RAID
        if (raidInfo.type !== 'none') {
          specsHtml += `<li><span class="check-icon">✓</span> Tipo RAID: ${raidInfo.isHardware ? 'Hardware' : 'Software'}</li>`;
          specsHtml += `<li><span class="check-icon">✓</span> Proteção: ${raidInfo.protection}</li>`;
        }
      }
      
      specsHtml += '</ul></div>';
      
      rows += `
        <tr>
          <td>Armazenamento interno</td>
          <td>
            <span class="component-name">${item.name}</span>
            <div class="component-description">Disco interno: ${item.name}</div>
            ${specsHtml}
          </td>
          <td class="text-right">${price}</td>
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
        specsHtml += `<li><span class="check-icon">✓</span> ${spec}</li>`;
      });
      specsHtml += '</ul></div>';
    }
    
    rows += `
      <tr>
        <td>Armazenamento externo</td>
        <td>
          <span class="component-name">${storage.name}</span>
          ${storage.description ? `<div class="component-description">${storage.description}</div>` : ''}
          ${specsHtml}
        </td>
        <td class="text-right">${price}</td>
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
        specsHtml += `<li><span class="check-icon">✓</span> ${spec}</li>`;
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
      specsHtml += `<li><span class="check-icon">✓</span> Quantidade: ${item.quantity}</li></ul></div>`;
    }
    
    rows += `
      <tr>
        <td>Conectividade</td>
        <td>
          <span class="component-name">${component.name}</span>
          ${component.description ? `<div class="component-description">${component.description}</div>` : ''}
          ${specsHtml}
        </td>
        <td class="text-right">${price}</td>
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
        specsHtml += `<li><span class="check-icon">✓</span> ${spec}</li>`;
      });
      specsHtml += '</ul></div>';
    }
    
    rows += `
      <tr>
        <td>Serviço Adicional</td>
        <td>
          <span class="component-name">${service.name}</span>
          ${service.description ? `<div class="component-description">${service.description}</div>` : ''}
          ${specsHtml}
        </td>
        <td class="text-right">${price}</td>
      </tr>
    `;
  });
  
  return rows;
}
