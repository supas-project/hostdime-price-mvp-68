
import { PDFDocument, PDFPage, PDFFont } from 'pdf-lib';
import { COLOR } from '../colors';
import { PageContext } from '../types';
import { hostDimeLogoBase64 } from '../../pdf-assets';

// Helper function to check if we need a new page
export const checkAndCreateNewPage = (
  pdfDoc: PDFDocument,
  currentPage: PDFPage,
  currentY: number,
  requiredSpace: number,
  marginX: number,
  marginY: number,
  helveticaFont: PDFFont
): PageContext => {
  if (currentY < requiredSpace) {
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
      height: 20,
      color: COLOR.SECONDARY,
      opacity: 0.05
    });
    
    // Add page number with updated styling
    newPage.drawText(`Página ${pageNumber}`, {
      x: width / 2 - 25,
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

// Improved header drawing function with new style
export const drawHeader = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number,
  currentY: number,
  helveticaBold: PDFFont
): Promise<number> => {
  // Draw header background in the new style
  page.drawRectangle({
    x: 0,
    y: currentY - 50,
    width: width,
    height: 50,
    color: COLOR.SECONDARY,
    opacity: 1
  });
  
  // Draw orange top border
  page.drawRectangle({
    x: 0,
    y: currentY,
    width: width,
    height: 4,
    color: COLOR.PRIMARY,
    borderWidth: 0
  });
  
  try {
    // Use embedded logo
    const logoImageBytes = Uint8Array.from(atob(hostDimeLogoBase64), c => c.charCodeAt(0));
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    
    // White background for logo
    page.drawRectangle({
      x: 50,
      y: currentY - 45,
      width: 140,
      height: 40,
      color: COLOR.WHITE,
      borderWidth: 0,
    });
    
    const logoWidth = 130;
    const logoHeight = logoWidth / (logoImage.width / logoImage.height);
    
    page.drawImage(logoImage, {
      x: 55,
      y: currentY - 42,
      width: logoWidth,
      height: logoHeight - 5
    });
  } catch (error) {
    console.error("Falha ao carregar logo:", error);
    // Fallback - draw "HostDime Brasil" text
    page.drawRectangle({
      x: 30,
      y: currentY - 40,
      width: 160,
      height: 30,
      color: COLOR.PRIMARY,
      opacity: 0.9,
    });
    
    page.drawText("HostDime Brasil", {
      x: 40,
      y: currentY - 25,
      size: 18,
      font: helveticaBold,
      color: COLOR.WHITE
    });
  }
  
  return currentY - 60;
};
