
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { buildQuotePDF, downloadPDF, openPDFInNewTab } from "./pdf/quote-builder";

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  openInNewTab: boolean = false
) => {
  try {
    // Notificar o usuário que o processo começou
    toast.info("Gerando PDF...", {
      description: "Aguarde enquanto preparamos seu documento"
    });
    
    // Gerar o PDF
    const pdfBytes = await buildQuotePDF(
      selectedComponents,
      storageItems,
      customServices,
      margin,
      connectivityItems
    );
    
    // Gerar nome do arquivo com número aleatório e data
    const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
    const fileName = `HostDime_Cotacao_${quoteNumber}.pdf`;
    
    // Abrir em nova aba ou fazer download dependendo do parâmetro
    if (openInNewTab) {
      openPDFInNewTab(pdfBytes, fileName);
    } else {
      downloadPDF(pdfBytes, fileName);
    }
    
    return pdfBytes;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    // Melhorando a mensagem de erro para ser mais específica
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    if (errorMessage.includes("encode") || errorMessage.includes("0x")) {
      toast.error("Erro de codificação no PDF", {
        description: "Foram encontrados caracteres especiais incompatíveis. Verifique os dados inseridos."
      });
    } else {
      toast.error("Falha ao gerar PDF", {
        description: "Tente novamente mais tarde ou contate o suporte técnico."
      });
    }
    throw error;
  }
};
