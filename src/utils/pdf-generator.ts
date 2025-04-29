
import { ComponentOption } from "@/types/component";
import { generateQuotePDF } from "./quote-export";
import { toast } from "sonner"; 

export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
): Promise<Uint8Array> {
  try {
    // Passando objetos vazios para os parâmetros adicionais requeridos
    await generateQuotePDF(
      selectedComponents, 
      { internal: [], external: [] }, 
      [], 
      margin
    );
    
    return new Uint8Array(); // Retorna array vazio já que o arquivo é baixado diretamente
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.error("Falha na geração do PDF", {
      description: (error as Error).message
    });
    throw new Error("Falha na geração do PDF: " + (error as Error).message);
  }
}
