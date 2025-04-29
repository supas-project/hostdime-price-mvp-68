
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { renderHeaderSection } from './section-renderers/header-section';
import { renderSummarySection } from './section-renderers/summary-section';
import { renderComponentsSection } from './section-renderers/components-section';
import { renderStorageSection } from './section-renderers/storage-section';
import { renderServicesSection } from './section-renderers/services-section';
import { renderFinancialSection } from './section-renderers/financial-section';
import { renderBenefitsSection } from './section-renderers/benefits-section';
import { renderTermsSection } from './section-renderers/terms-section';

export async function buildQuotePDF(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {}
): Promise<Uint8Array> {
  try {
    toast.info("Gerando PDF...", {
      description: "Aguarde enquanto preparamos seu documento"
    });
    
    const pdfDoc = await PDFDocument.create();
    
    // Load the standardized fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    
    // Set up the first page of the PDF
    let page = pdfDoc.addPage([595.276, 841.890]); // A4 dimensions
    const { width, height } = page.getSize();
    
    // Page margins
    const marginX = 50;
    const marginRight = width - marginX;
    
    // 1. Header Section
    const { currentY, quoteNumber } = await renderHeaderSection(
      pdfDoc, page, width, height, helvetica, helveticaBold, marginX
    );
    
    // 2. Summary Section
    let newY = renderSummarySection(
      page, currentY, width, marginX, helveticaBold, helvetica
    );
    
    // 3. Components Section
    let pageContext = renderComponentsSection(
      pdfDoc, { page, y: newY }, selectedComponents, width, marginX, 
      marginRight, helvetica, helveticaBold, helveticaOblique
    );
    
    // 4. Storage Section
    pageContext = renderStorageSection(
      pdfDoc, pageContext, storageItems, width, marginX, 
      marginRight, helvetica, helveticaBold, helveticaOblique
    );
    
    // 5. Services Section
    pageContext = renderServicesSection(
      pdfDoc, pageContext, customServices, width, marginX, 
      marginRight, helvetica, helveticaBold, helveticaOblique
    );
    
    // 6. Financial Summary
    pageContext = renderFinancialSection(
      pdfDoc, pageContext, selectedComponents, storageItems, customServices, 
      margin, width, marginX, marginRight, helvetica, helveticaBold,
      connectivityItems
    );
    
    // 7. Benefits Section
    pageContext = renderBenefitsSection(
      pdfDoc, pageContext, marginX, helvetica, helveticaBold
    );
    
    // 8. Terms and Conditions
    renderTermsSection(
      pdfDoc, pageContext, marginX, helvetica, helveticaBold
    );
    
    // Finalize PDF and return bytes
    return await pdfDoc.save();
    
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.error("Falha ao gerar PDF", {
      description: (error as Error).message
    });
    throw new Error("Falha na geração do PDF: " + (error as Error).message);
  }
}

// Helper function to trigger PDF download
export function downloadPDF(pdfBytes: Uint8Array, fileName: string): void {
  // Create blob and trigger download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  
  // Success notification
  toast.success("PDF Gerado com Sucesso", {
    description: "Seu documento foi baixado automaticamente"
  });
}
