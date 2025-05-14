
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { buildQuotePDF, downloadPDF, openPDFInNewTab } from "./pdf/quote-builder";
import { QuoteVariables } from "./pdf/dynamic-variables";
import { sanitizeText } from "./pdf/drawing-utils";

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
    
    // Sanitizar variáveis dinâmicas mais completamente
    const sanitizedVariables = quoteVariables ? {
      ...quoteVariables,
      responsavelComercial: sanitizeText(quoteVariables.responsavelComercial || ''),
      clientName: sanitizeText(quoteVariables.clientName || ''),
      dataValidade: sanitizeText(quoteVariables.dataValidade || ''),
      observacoes: sanitizeText(quoteVariables.observacoes || ''),
      dataEmissao: sanitizeText(quoteVariables.dataEmissao || ''),
      numeroContato: sanitizeText(quoteVariables.numeroContato || ''),
      emailContato: sanitizeText(quoteVariables.emailContato || '')
    } : undefined;
    
    // Sanitizar itens de armazenamento com método melhorado
    const sanitizedStorageItems = {
      internal: storageItems.internal.map(item => ({
        ...item,
        name: sanitizeText(item.name),
        description: sanitizeText(item.description || ''),
        details: item.details?.map(detail => sanitizeText(detail)) || []
      })),
      external: storageItems.external.map(item => ({
        ...item,
        name: sanitizeText(item.name),
        description: sanitizeText(item.description || ''),
        details: item.details?.map(detail => sanitizeText(detail)) || []
      }))
    };
    
    // Sanitizar serviços personalizados com método melhorado
    const sanitizedCustomServices = customServices.map(service => ({
      ...service,
      name: sanitizeText(service.name),
      description: sanitizeText(service.description || ''),
      details: service.details?.map(detail => sanitizeText(detail)) || []
    }));
    
    // Sanitizar itens de conectividade com método melhorado
    const sanitizedConnectivityItems: typeof connectivityItems = {};
    for (const key in connectivityItems) {
      if (connectivityItems[key]) {
        sanitizedConnectivityItems[key] = {
          option: {
            ...connectivityItems[key].option,
            name: sanitizeText(connectivityItems[key].option.name),
            description: sanitizeText(connectivityItems[key].option.description || ''),
            details: connectivityItems[key].option.details?.map(detail => sanitizeText(detail)) || []
          },
          quantity: connectivityItems[key].quantity
        };
      }
    }
    
    // Generate PDF with dynamic variables
    const pdfBytes = await buildQuotePDF(
      selectedComponents,
      sanitizedStorageItems,
      sanitizedCustomServices,
      margin,
      sanitizedConnectivityItems,
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
    
    // Enhanced error handling with more specific messages
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("encode") || errorMessage.includes("0x") || errorMessage.includes("WinAnsi")) {
      toast.error("Caracteres especiais foram removidos automaticamente", {
        description: "Documento gerado com texto simplificado"
      });
    } else if (errorMessage.includes("image") || errorMessage.includes("logo")) {
      toast.error("Não foi possível incluir as imagens no documento", {
        description: "Tente novamente com outras imagens"
      });
    } else {
      toast.error("Falha ao gerar o PDF", {
        description: "Tente novamente mais tarde ou contate o suporte técnico"
      });
    }
    
    throw error;
  }
};
