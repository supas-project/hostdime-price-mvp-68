
import { ComponentOption } from "@/types/component";
import { generateQuotePDF, generateQuoteWebView } from "./quote-export";
import { toast } from "sonner"; 
import { QuoteVariables } from "./pdf/dynamic-variables";
import { sanitizeText } from "./pdf/drawing-utils";

export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number,
  openInNewTab: boolean = true,
  quoteVariables?: Partial<QuoteVariables>,
  format: 'pdf' | 'web' = 'pdf'
): Promise<Uint8Array | void> {
  try {
    // Show processing toast
    toast("Preparando os dados para visualização");
    
    // Sanitização mais robusta para componentes
    const sanitizedComponents: { [key: string]: ComponentOption } = {};
    for (const key in selectedComponents) {
      if (selectedComponents[key]) {
        const component = selectedComponents[key];
        sanitizedComponents[key] = {
          ...component,
          name: sanitizeText(component.name),
          description: sanitizeText(component.description || ''),
          details: component.details?.map(detail => sanitizeText(detail)) || [],
          metadata: component.metadata, // Manter metadados intactos
          // Certificar que valores numéricos estão intactos
          price: component.price,
          type: sanitizeText(component.type),
          subtype: component.subtype ? sanitizeText(component.subtype) : undefined
        };
      }
    }
    
    // Sanitizar variáveis do PDF com tratamento especial para datas
    const sanitizedVariables = quoteVariables ? {
      ...quoteVariables,
      responsavelComercial: sanitizeText(quoteVariables.responsavelComercial || ''),
      clientName: sanitizeText(quoteVariables.clientName || ''),
      dataValidade: sanitizeText(quoteVariables.dataValidade || '').replace(/\//g, '-'),
      observacoes: sanitizeText(quoteVariables.observacoes || ''),
      dataEmissao: sanitizeText(quoteVariables.dataEmissao || '').replace(/\//g, '-'),
      numeroContato: sanitizeText(quoteVariables.numeroContato || ''),
      emailContato: sanitizeText(quoteVariables.emailContato || '')
    } : undefined;
    
    // Choose between PDF and Web view based on format parameter
    if (format === 'web') {
      // Generate web view
      generateQuoteWebView(
        sanitizedComponents, 
        { internal: [], external: [] }, 
        [], 
        margin,
        {}, // Empty connectivity items
        sanitizedVariables
      );
      return;
    } else {
      // Generate PDF (default behavior)
      const pdfBytes = await generateQuotePDF(
        sanitizedComponents, 
        { internal: [], external: [] }, 
        [], 
        margin,
        {}, // Empty connectivity items
        openInNewTab,
        sanitizedVariables
      );
      
      return pdfBytes;
    }
  } catch (error) {
    console.error("Erro ao gerar documento:", error);
    
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
    } else if (errorMessage.includes("popup") || errorMessage.includes("blocked")) {
      message = "O navegador bloqueou a abertura da nova aba";
    }
    
    toast.error("Falha na geração do documento", {
      description: message
    });
    
    throw new Error("Falha na geração do documento: " + errorMessage);
  }
}
