
import { ComponentOption } from "@/types/component";
import { generateQuoteFromTemplate } from "./pdf-generator";

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
) => {
  try {
    const pdfBytes = await generateQuoteFromTemplate(selectedComponents, margin);
    
    // Criar um Blob com os bytes do PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    
    // Criar URL para download
    const url = URL.createObjectURL(blob);
    
    // Criar link para download
    const link = document.createElement('a');
    link.href = url;
    link.download = `cotacao-servidor-${new Date().toISOString().split('T')[0]}.pdf`;
    
    // Simular clique para download
    document.body.appendChild(link);
    link.click();
    
    // Limpar
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};
