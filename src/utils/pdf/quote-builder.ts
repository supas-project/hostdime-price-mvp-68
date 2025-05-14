
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { QuoteVariables } from './dynamic-variables';
import { sanitizeText } from './drawing-utils';

export async function buildQuotePDF(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  quoteVariables?: Partial<QuoteVariables>
): Promise<Uint8Array> {
  try {
    toast.info("Gerando PDF...");
    
    // Criar documento PDF simples
    const pdfDoc = await PDFDocument.create();
    
    // Carregar fontes básicas
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Configurar primeira página
    let page = pdfDoc.addPage([595.276, 841.890]); // A4
    const { width, height } = page.getSize();
    
    // Definir margens
    const marginX = 50;
    
    // Cabeçalho simples
    page.drawText("HostDime Brasil", {
      x: marginX,
      y: height - 50,
      size: 24,
      font: helveticaBold,
    });
    
    // Número da cotação simples
    const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
    page.drawText(`Cotação #${quoteNumber}`, {
      x: marginX,
      y: height - 80,
      size: 14,
      font: helveticaBold,
    });
    
    // Data da cotação
    const today = new Date().toLocaleDateString('pt-BR');
    page.drawText(`Data: ${today}`, {
      x: marginX,
      y: height - 100,
      size: 12,
      font: helvetica,
    });
    
    // Cliente
    if (quoteVariables?.clientName) {
      page.drawText(`Cliente: ${quoteVariables.clientName}`, {
        x: marginX,
        y: height - 120,
        size: 12,
        font: helvetica,
      });
    }
    
    // Título de componentes
    page.drawText("Componentes do Servidor", {
      x: marginX,
      y: height - 160,
      size: 16,
      font: helveticaBold,
    });
    
    // Lista simples de componentes
    let yPos = height - 190;
    const componentKeys = Object.keys(selectedComponents).filter(key => selectedComponents[key] != null);
    
    for (const key of componentKeys) {
      const component = selectedComponents[key];
      if (component) {
        page.drawText(`${component.name}: R$ ${component.price.toFixed(2).replace('.', ',')}`, {
          x: marginX,
          y: yPos,
          size: 12,
          font: helvetica,
        });
        yPos -= 20;
      }
    }
    
    // Resumo financeiro simples
    yPos -= 30;
    page.drawText("Resumo Financeiro", {
      x: marginX,
      y: yPos,
      size: 16,
      font: helveticaBold,
    });
    
    yPos -= 30;
    
    // Calcular valor total
    let total = 0;
    for (const key of componentKeys) {
      if (selectedComponents[key]) {
        total += selectedComponents[key].price || 0;
      }
    }
    
    // Aplicar margem
    if (margin > 0) {
      total = total * (1 + (margin / 100));
    }
    
    page.drawText(`Total Mensal: R$ ${total.toFixed(2).replace('.', ',')}`, {
      x: marginX,
      y: yPos,
      size: 14,
      font: helveticaBold,
    });
    
    // Observações
    if (quoteVariables?.observacoes) {
      yPos -= 50;
      page.drawText("Observações:", {
        x: marginX,
        y: yPos,
        size: 14,
        font: helveticaBold,
      });
      
      yPos -= 20;
      page.drawText(quoteVariables.observacoes, {
        x: marginX,
        y: yPos,
        size: 12,
        font: helvetica,
      });
    }
    
    // Contato
    yPos -= 50;
    page.drawText("Para mais informações:", {
      x: marginX,
      y: yPos,
      size: 12,
      font: helveticaBold,
    });
    
    yPos -= 20;
    page.drawText("Telefone: (11) 4766-4840", {
      x: marginX,
      y: yPos,
      size: 12,
      font: helvetica,
    });
    
    yPos -= 20;
    page.drawText("Email: vendas@hostdime.com.br", {
      x: marginX,
      y: yPos,
      size: 12,
      font: helvetica,
    });
    
    // Finalizar PDF
    return await pdfDoc.save();
    
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.error("Falha ao gerar PDF");
    throw new Error("Falha na geração do PDF: " + (error as Error).message);
  }
}

// Helper function to trigger PDF download
export function downloadPDF(pdfBytes: Uint8Array, fileName: string): void {
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  
  toast.success("PDF Gerado com Sucesso", {
    description: "Seu documento foi baixado automaticamente"
  });
}

// Função para abrir o PDF em uma nova aba
export function openPDFInNewTab(pdfBytes: Uint8Array, fileName: string): void {
  try {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    const newTab = window.open(blobUrl, '_blank');
    
    if (newTab) {
      newTab.focus();
      toast.success("PDF Gerado com Sucesso", {
        description: "O documento foi aberto em uma nova aba"
      });
    } else {
      toast.warning("Popup bloqueado pelo navegador", {
        description: "Tente permitir popups para este site ou faça o download direto"
      });
      
      downloadPDF(pdfBytes, fileName);
    }
    
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 30000);
  } catch (error) {
    console.error("Erro ao abrir PDF:", error);
    toast.error("Falha ao abrir PDF", {
      description: "Tentando fazer o download direto como alternativa"
    });
    
    try {
      downloadPDF(pdfBytes, fileName);
    } catch (downloadError) {
      console.error("Erro no fallback de download:", downloadError);
      toast.error("Falha completa na geração do PDF", {
        description: "Contate o suporte técnico"
      });
    }
  }
}
