
import { ComponentOption } from "@/types/component";
import { generateQuotePDF } from "./quote-export";
import { toast } from "sonner"; 

export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
): Promise<Uint8Array> {
  try {
    // Mostrar toast de processamento
    toast.info("Iniciando geração do PDF...", {
      description: "Preparando os dados para visualização"
    });
    
    // Passando objetos vazios para os parâmetros adicionais requeridos
    const pdfBytes = await generateQuotePDF(
      selectedComponents, 
      { internal: [], external: [] }, 
      [], 
      margin,
      {}, // Adicionando connectivityItems vazio
      true // Novo parâmetro para abrir em nova aba
    );
    
    return pdfBytes;
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.error("Falha na geração do PDF", {
      description: "Verifique se todos os dados estão corretos e tente novamente"
    });
    throw new Error("Falha na geração do PDF: " + (error instanceof Error ? error.message : String(error)));
  }
}
