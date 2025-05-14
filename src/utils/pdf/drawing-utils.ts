import { PDFDocument, PDFPage, PDFFont, RGB } from 'pdf-lib';
import { COLOR } from './colors';
import { PageContext } from './types';
import { hostDimeLogoBase64 } from '../pdf-assets';

// Helper function to create a highlighted box for important information
export const drawHighlightBox = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB = COLOR.HIGHLIGHT,
  borderColor: RGB = COLOR.PRIMARY_LIGHT
) => {
  // Add solid background with border
  page.drawRectangle({
    x: x,
    y: y - height,
    width: width,
    height: height,
    color: color,
    borderColor: borderColor,
    borderWidth: 1,
    opacity: 0.95
  });
};

// Enhanced separator with new style
export const drawSeparator = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  opacity: number = 0.7
) => {
  // Draw simple line separator in the new style
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 1,
    color: COLOR.PRIMARY_LIGHT,
    opacity: opacity
  });
};

// Helper function to draw table rows with alternating colors - updated for new style
export const drawTableRow = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  isAlternate: boolean = false
) => {
  if (isAlternate) {
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: COLOR.TABLE_ROW_ALT,
      borderWidth: 0
    });
  } else {
    // Draw very subtle background for even rows
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: COLOR.WHITE,
      borderWidth: 0
    });
  }
};

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

// Enhanced section header with new styling
export const drawSectionHeader = (
  page: PDFPage, 
  text: string,
  x: number,
  y: number,
  width: number,
  boldFont: PDFFont,
  size: number = 16,
  color: RGB = COLOR.PRIMARY,
  useHighlightStyle: boolean = true
): number => {
  if (useHighlightStyle) {
    // Draw background highlight in the new style - light orange background
    page.drawRectangle({
      x: x - 5,
      y: y - 5,
      width: width,
      height: size + 10,
      color: COLOR.HIGHLIGHT,
      borderWidth: 0,
    });
  }
  
  // Draw the actual text
  page.drawText(text, {
    x: x,
    y: y,
    size: size,
    font: boldFont,
    color: color
  });
  
  return y - (size + 20); // Return new Y position after the header
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
