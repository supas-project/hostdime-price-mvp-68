
import { ComponentOption } from "@/types/component";
import { QuoteVariables } from "@/utils/pdf/dynamic-variables";
import { generateComponentsRows, generateStorageRows, generateConnectivityRows, generateCustomServicesRows } from "./component-renderers";
import { calculateQuoteTotal } from "./price-calculator";
import { generateQuoteTemplate } from "./template-generator";

// Função principal para gerar HTML da cotação
export function generateQuoteHTML(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  quoteVariables?: Partial<QuoteVariables>
): string {
  // Gerar HTML para os componentes da tabela
  const componentsRowsHTML = generateComponentsRows(selectedComponents);
  const storageRowsHTML = generateStorageRows(storageItems.internal, storageItems.external);
  const connectivityRowsHTML = generateConnectivityRows(connectivityItems);
  const customServicesRowsHTML = generateCustomServicesRows(customServices);
  
  // Calcular o valor total
  const total = calculateQuoteTotal(
    selectedComponents,
    storageItems,
    customServices,
    margin,
    connectivityItems
  );
  
  // Gerar o template HTML completo
  return generateQuoteTemplate(
    componentsRowsHTML,
    storageRowsHTML,
    connectivityRowsHTML,
    customServicesRowsHTML,
    total,
    margin,
    quoteVariables
  );
}

// Função para abrir a cotação em uma nova aba
export function openQuoteInNewTab(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  quoteVariables?: Partial<QuoteVariables>
): void {
  try {
    // Gera o HTML da cotação
    const htmlContent = generateQuoteHTML(
      selectedComponents,
      storageItems,
      customServices,
      margin,
      connectivityItems,
      quoteVariables
    );
    
    // Abre uma nova aba
    const newTab = window.open('', '_blank');
    
    if (!newTab) {
      throw new Error('Não foi possível abrir uma nova aba. Verifique se o navegador está bloqueando popups.');
    }
    
    // Escreve o conteúdo HTML na nova aba
    newTab.document.write(htmlContent);
    newTab.document.close();
    
  } catch (error) {
    console.error('Erro ao abrir cotação em nova aba:', error);
    throw error;
  }
}
