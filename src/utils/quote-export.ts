
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { buildQuotePDF, downloadPDF, openPDFInNewTab } from "./pdf/quote-builder";
import { QuoteVariables } from "./pdf/dynamic-variables";
import { sanitizeText } from "./pdf/drawing-utils";
import { generateQuoteTemplate } from "./html/template-generator";
import { calculateQuoteTotal } from "./html/price-calculator";
import { 
  generateComponentsRows, 
  generateStorageRows, 
  generateConnectivityRows, 
  generateCustomServicesRows 
} from "./html/component-renderers";
import { deduplicateStorageItems } from "./html/price-calculator";

// Function to open the quote in a new tab with the HTML template
export const openQuoteInNewTab = (
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  quoteVariables?: Partial<QuoteVariables>
) => {
  try {
    console.log("[Quote] Abrindo cotação na web: verificando dados");
    
    // CORREÇÃO: Deduplica os discos e storages explicitamente
    const uniqueStorageItems = {
      internal: deduplicateStorageItems(storageItems.internal || []),
      external: deduplicateStorageItems(storageItems.external || [])
    };
    
    // Log de quantidade para debug
    console.log(`[Quote] Discos originais: ${storageItems.internal?.length || 0}, deduplificados: ${uniqueStorageItems.internal.length}`);
    
    // Calculate total price with deduplicated storage items
    const total = calculateQuoteTotal(
      selectedComponents, 
      uniqueStorageItems, 
      customServices, 
      margin, 
      connectivityItems
    );
    
    // Generate HTML rows for each component type
    const componentsRows = generateComponentsRows(selectedComponents);
    const storageRows = generateStorageRows(uniqueStorageItems.internal, uniqueStorageItems.external);
    const connectivityRows = generateConnectivityRows(connectivityItems);
    const customServicesRows = generateCustomServicesRows(customServices);
    
    // Generate the complete HTML template
    const htmlContent = generateQuoteTemplate(
      componentsRows,
      storageRows,
      connectivityRows,
      customServicesRows,
      total,
      margin,
      quoteVariables
    );
    
    // Open in a new tab
    const newTab = window.open('', '_blank');
    if (!newTab) {
      throw new Error('Não foi possível abrir uma nova aba. Verifique se o navegador está bloqueando popups.');
    }
    
    newTab.document.open();
    newTab.document.write(htmlContent);
    newTab.document.close();
    
    return newTab;
  } catch (error) {
    console.error("Erro ao abrir cotação em nova aba:", error);
    toast.error("Falha ao abrir a visualização", {
      description: "Verifique se o navegador permite popups neste site"
    });
    throw error;
  }
};

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  openInNewTab: boolean = true,
  quoteVariables?: Partial<QuoteVariables>
) => {
  try {
    // Notify user that process has started
    toast("Aguarde enquanto preparamos seu documento");
    
    // Sanitizar variáveis dinâmicas simplificadas
    const sanitizedVariables = quoteVariables ? {
      responsavelComercial: sanitizeText(quoteVariables.responsavelComercial || ''),
      clientName: sanitizeText(quoteVariables.clientName || ''),
      dataValidade: sanitizeText(quoteVariables.dataValidade || ''),
      observacoes: sanitizeText(quoteVariables.observacoes || ''),
      dataEmissao: sanitizeText(quoteVariables.dataEmissao || ''),
      numeroContato: sanitizeText(quoteVariables.numeroContato || ''),
      emailContato: sanitizeText(quoteVariables.emailContato || '')
    } : undefined;
    
    // Generate simplified PDF
    const pdfBytes = await buildQuotePDF(
      selectedComponents,
      storageItems,
      customServices,
      margin,
      connectivityItems,
      sanitizedVariables
    );
    
    // Generate unique filename with timestamp
    const timestamp = new Date().getTime();
    const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
    const fileName = `HostDime_Cotacao_${quoteNumber}.pdf`;
    
    // Open in new tab or download based on parameter
    if (openInNewTab) {
      openPDFInNewTab(pdfBytes, fileName);
    } else {
      downloadPDF(pdfBytes, fileName);
    }
    
    return pdfBytes;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    
    toast.error("Falha ao gerar o PDF", {
      description: "Tente novamente mais tarde ou contate o suporte técnico"
    });
    
    throw error;
  }
};

// Função para gerar visualização de cotação em HTML
export const generateQuoteWebView = (
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  quoteVariables?: Partial<QuoteVariables>
) => {
  try {
    // Notify user that process has started
    toast("Abrindo visualização da cotação");
    
    // Abrir a cotação em uma nova guia
    openQuoteInNewTab(
      selectedComponents,
      storageItems,
      customServices,
      margin,
      connectivityItems,
      quoteVariables
    );
    
    toast.success("Cotação aberta em nova aba");
    
  } catch (error) {
    console.error("Erro ao abrir visualização da cotação:", error);
    
    toast.error("Não foi possível abrir a visualização", {
      description: "Verifique se o navegador permite popups neste site"
    });
    
    throw error;
  }
};
