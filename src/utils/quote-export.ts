
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { buildQuotePDF, downloadPDF } from "./pdf/quote-builder";

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number
) => {
  try {
    // Gerar o PDF
    const pdfBytes = await buildQuotePDF(
      selectedComponents,
      storageItems,
      customServices,
      margin
    );
    
    // Gerar nome do arquivo com número aleatório e data
    const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
    const fileName = `HostDime_Cotação_${quoteNumber}.pdf`;
    
    // Fazer o download do PDF
    downloadPDF(pdfBytes, fileName);
    
    return pdfBytes;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.error("Falha ao gerar PDF", {
      description: "Tente novamente mais tarde"
    });
    throw error;
  }
};
