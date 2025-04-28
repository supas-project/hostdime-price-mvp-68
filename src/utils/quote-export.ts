
import { ComponentOption } from "@/types/component";
import { generateQuoteFromTemplate } from "./pdf-generator";
import { toast } from "sonner";

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
) => {
  try {
    const pdfBytes = await generateQuoteFromTemplate(selectedComponents, margin);
    
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HostDime-Proposta-${new Date().toISOString().split('T')[0]}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("PDF gerado com sucesso!");
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error("Erro ao gerar o PDF. Por favor, tente novamente.");
    throw error;
  }
};
