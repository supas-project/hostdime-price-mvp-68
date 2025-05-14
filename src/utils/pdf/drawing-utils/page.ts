
import { PDFDocument, PDFPage, PDFFont } from 'pdf-lib';
import { COLOR } from '../colors';
import { PageContext } from '../types';
import { hostDimeLogoBase64 } from '../../pdf-assets';
import { embedAndDrawImage } from './images';

// Enhanced helper function to check if we need a new page with improved spacing
export const checkAndCreateNewPage = (
  pdfDoc: PDFDocument,
  currentPage: PDFPage,
  currentY: number,
  requiredSpace: number,
  marginX: number,
  marginY: number,
  helveticaFont: PDFFont
): PageContext => {
  // Add a small buffer to required space for better content flow
  const bufferedSpace = requiredSpace + 20;
  
  if (currentY < bufferedSpace) {
    // Create new page
    const newPage = pdfDoc.addPage([595.276, 841.890]);
    const { width, height } = newPage.getSize();
    
    // Add page number at the bottom
    const pageNumber = pdfDoc.getPageCount();
    
    // Draw footer with new style
    newPage.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 25,
      color: COLOR.BACKGROUND,
      opacity: 0.8
    });
    
    // Add page number with updated styling
    newPage.drawText(`Página ${pageNumber}`, {
      x: width / 2 - helveticaFont.widthOfTextAtSize(`Página ${pageNumber}`, 9) / 2,
      y: 10,
      size: 9,
      font: helveticaFont,
      color: COLOR.TEXT_LIGHT
    });
    
    // Add orange top border
    newPage.drawRectangle({
      x: 0,
      y: height - 4,
      width: width,
      height: 4,
      color: COLOR.PRIMARY,
      borderWidth: 0
    });
    
    return { page: newPage, y: height - marginY };
  }
  
  return { page: currentPage, y: currentY };
};

// Improved header drawing function with enhanced styling and error handling
export const drawHeader = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number,
  currentY: number,
  helveticaBold: PDFFont
): Promise<number> => {
  // Draw header background with gradient-like effect
  page.drawRectangle({
    x: 0,
    y: currentY - 55,
    width: width,
    height: 55,
    color: COLOR.SECONDARY,
    opacity: 1
  });
  
  // Draw orange top border with slight glow effect
  page.drawRectangle({
    x: 0,
    y: currentY,
    width: width,
    height: 4,
    color: COLOR.PRIMARY,
    borderWidth: 0
  });
  
  try {
    // Use embedded logo with proper error handling
    const logoImageBytes = Uint8Array.from(atob(hostDimeLogoBase64), c => c.charCodeAt(0));
    
    // Use the new helper function for image embedding
    const logoEmbedded = await embedAndDrawImage(
      pdfDoc,
      page,
      logoImageBytes,
      {
        x: 50,
        y: currentY - 5,
        width: 140,
        height: 45
      },
      "HostDime Brasil",
      helveticaBold
    );
    
    // If logo failed to embed, draw text fallback (handled in embedAndDrawImage)
    
  } catch (error) {
    console.error("Falha ao carregar logo:", error);
    // Fallback already handled in embedAndDrawImage
  }
  
  return currentY - 65; // Return slightly more space for better layout
};
