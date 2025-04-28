
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ComponentOption } from "@/types/component";
import { PDFConfig } from './pdf/constants';
import { addCoverPage } from './pdf/pages/cover-page';
import { addInstitutionalPage } from './pdf/pages/institutional-page';
import { addConfidentialityPage } from './pdf/pages/confidentiality-page';
import { addQuotePage } from './pdf/pages/quote-page';
import { addDataCenterPage } from './pdf/pages/datacenter-page';
import { addContactPage } from './pdf/pages/contact-page';

export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
): Promise<Uint8Array> {
  // Create PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Load fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Add pages
  let page = pdfDoc.addPage([PDFConfig.pageSize.width, PDFConfig.pageSize.height]);
  addCoverPage(page, boldFont, font);
  
  page = pdfDoc.addPage([PDFConfig.pageSize.width, PDFConfig.pageSize.height]);
  addInstitutionalPage(page, boldFont, font);
  
  page = pdfDoc.addPage([PDFConfig.pageSize.width, PDFConfig.pageSize.height]);
  addConfidentialityPage(page, boldFont, font);
  
  page = pdfDoc.addPage([PDFConfig.pageSize.width, PDFConfig.pageSize.height]);
  addQuotePage(page, selectedComponents, margin, boldFont, font, italicFont);
  
  page = pdfDoc.addPage([PDFConfig.pageSize.width, PDFConfig.pageSize.height]);
  addDataCenterPage(page, boldFont, font);
  
  page = pdfDoc.addPage([PDFConfig.pageSize.width, PDFConfig.pageSize.height]);
  addContactPage(page, boldFont, font, italicFont);
  
  // Return the finalized PDF
  return pdfDoc.save();
}

