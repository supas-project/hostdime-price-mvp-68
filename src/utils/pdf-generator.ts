
import { ComponentOption } from "@/types/component";
import { generateQuotePDF } from "./quote-export";
import { toast } from "sonner"; 
import { QuoteVariables } from "./pdf/dynamic-variables";

export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number,
  openInNewTab: boolean = true, // Changed default to true for new tab opening
  quoteVariables?: Partial<QuoteVariables>
): Promise<Uint8Array> {
  try {
    // Show processing toast
    toast("Preparando os dados para visualização");
    
    // Generate PDF with all required parameters
    const pdfBytes = await generateQuotePDF(
      selectedComponents, 
      { internal: [], external: [] }, 
      [], 
      margin,
      {}, // Empty connectivity items
      openInNewTab, // Pass parameter to open in new tab
      quoteVariables // Pass dynamic variables
    );
    
    return pdfBytes;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    
    // Enhanced error messaging with more specific information
    const errorMessage = error instanceof Error ? error.message : String(error);
    let message = "Verifique se todos os dados estão corretos e tente novamente";
    
    // Provide more specific error message based on error type
    if (errorMessage.includes("encode") || errorMessage.includes("character")) {
      message = "Foram encontrados caracteres especiais incompatíveis no documento";
    } else if (errorMessage.includes("font") || errorMessage.includes("text")) {
      message = "Problema ao renderizar o texto no documento";
    } else if (errorMessage.includes("image") || errorMessage.includes("logo")) {
      message = "Não foi possível carregar imagens no documento";
    }
    
    toast.error(message);
    
    throw new Error("Falha na geração do PDF: " + errorMessage);
  }
}
