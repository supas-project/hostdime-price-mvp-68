
import { ComponentOption } from "@/types/component";
import { generateQuotePDF } from "./quote-export";
import { toast } from "sonner"; 
import { QuoteVariables } from "./pdf/dynamic-variables";
import { sanitizeText } from "./pdf/drawing-utils";

export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number,
  openInNewTab: boolean = true,
  quoteVariables?: Partial<QuoteVariables>
): Promise<Uint8Array> {
  try {
    // Show processing toast
    toast("Preparando os dados para visualização");
    
    // Sanitizar todas as strings nos componentes para evitar problemas de codificação
    const sanitizedComponents: { [key: string]: ComponentOption } = {};
    for (const key in selectedComponents) {
      if (selectedComponents[key]) {
        const component = selectedComponents[key];
        sanitizedComponents[key] = {
          ...component,
          name: sanitizeText(component.name),
          description: sanitizeText(component.description),
          details: component.details?.map(sanitizeText) || []
        };
      }
    }
    
    // Generate PDF with all required parameters
    const pdfBytes = await generateQuotePDF(
      sanitizedComponents, 
      { internal: [], external: [] }, 
      [], 
      margin,
      {}, // Empty connectivity items
      openInNewTab,
      quoteVariables
    );
    
    return pdfBytes;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    
    // Enhanced error messaging with more specific information
    const errorMessage = error instanceof Error ? error.message : String(error);
    let message = "Verifique se todos os dados estão corretos e tente novamente";
    
    // Provide more specific error message based on error type
    if (errorMessage.includes("encode") || errorMessage.includes("character") || errorMessage.includes("WinAnsi")) {
      message = "Foram encontrados caracteres especiais incompatíveis no documento";
      console.error("Erro de codificação:", errorMessage);
    } else if (errorMessage.includes("font") || errorMessage.includes("text")) {
      message = "Problema ao renderizar o texto no documento";
    } else if (errorMessage.includes("image") || errorMessage.includes("logo")) {
      message = "Não foi possível carregar imagens no documento";
    }
    
    toast.error("Falha na geração do PDF", {
      description: message
    });
    
    throw new Error("Falha na geração do PDF: " + errorMessage);
  }
}
