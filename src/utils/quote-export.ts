
import { ComponentOption } from "@/types/component";
import { toast } from "@/components/ui/use-toast";
import { buildQuotePDF, downloadPDF, openPDFInNewTab } from "./pdf/quote-builder";
import { QuoteVariables } from "./pdf/dynamic-variables";

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  openInNewTab: boolean = true, // Changed default to true for new tab opening
  quoteVariables?: Partial<QuoteVariables>
) => {
  try {
    // Notify user that process has started
    toast({
      description: "Aguarde enquanto preparamos seu documento",
      duration: 3000,
    });
    
    // Generate PDF with dynamic variables
    const pdfBytes = await buildQuotePDF(
      selectedComponents,
      storageItems,
      customServices,
      margin,
      connectivityItems,
      quoteVariables
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
    
    if (errorMessage.includes("encode") || errorMessage.includes("0x")) {
      toast({
        description: "Foram encontrados caracteres especiais incompatíveis. Verifique os dados inseridos.",
        variant: "destructive",
        duration: 5000,
      });
    } else if (errorMessage.includes("image") || errorMessage.includes("logo")) {
      toast({
        description: "Não foi possível incluir as imagens no documento.",
        variant: "destructive",
        duration: 5000,
      });
    } else {
      toast({
        description: "Tente novamente mais tarde ou contate o suporte técnico.",
        variant: "destructive",
        duration: 5000,
      });
    }
    
    throw error;
  }
};
