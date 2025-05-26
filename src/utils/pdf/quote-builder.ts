
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { QuoteVariables } from './dynamic-variables';
import { sanitizeText } from './drawing-utils';
import { 
  renderHeaderSection,
  renderComponentsSection, 
  renderStorageSection,
  renderServicesSection,
  renderFinancialSection,
  renderTermsSection,
  renderContractSection
} from './section-renderers';

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
    const marginRight = 50;
    
    // Render header section
    let pageContext = await renderHeaderSection(
      pdfDoc,
      { page, y: height - 50 },
      quoteVariables,
      width,
      marginX,
      marginRight,
      helvetica,
      helveticaBold
    );
    
    // Render contract section (destacado conforme solicitado)
    pageContext = renderContractSection(
      pdfDoc,
      pageContext,
      selectedComponents,
      width,
      marginX,
      marginRight,
      helvetica,
      helveticaBold
    );
    
    // Render components section
    pageContext = renderComponentsSection(
      pdfDoc,
      pageContext,
      selectedComponents,
      width,
      marginX,
      marginRight,
      helvetica,
      helveticaBold
    );
    
    // Render storage section if exists
    if (storageItems.internal.length > 0 || storageItems.external.length > 0) {
      pageContext = renderStorageSection(
        pdfDoc,
        pageContext,
        storageItems,
        width,
        marginX,
        marginRight,
        helvetica,
        helveticaBold
      );
    }
    
    // Render custom services if exists
    if (customServices.length > 0) {
      pageContext = renderServicesSection(
        pdfDoc,
        pageContext,
        customServices,
        width,
        marginX,
        marginRight,
        helvetica,
        helveticaBold
      );
    }
    
    // Render financial section
    pageContext = renderFinancialSection(
      pdfDoc,
      pageContext,
      selectedComponents,
      storageItems,
      customServices,
      margin,
      width,
      marginX,
      marginRight,
      helvetica,
      helveticaBold,
      connectivityItems
    );
    
    // Render terms section
    renderTermsSection(
      pdfDoc,
      pageContext,
      quoteVariables,
      width,
      marginX,
      marginRight,
      helvetica,
      helveticaBold
    );
    
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
