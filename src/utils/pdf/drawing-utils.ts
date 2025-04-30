
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
  // Add subtle gradient effect by using multiple rectangles with decreasing opacity
  for (let i = 0; i < 3; i++) {
    const opacity = 0.7 - (i * 0.2);
    page.drawRectangle({
      x: x + i,
      y: y - height + i,
      width: width - (i * 2),
      height: height - (i * 2),
      color: color,
      borderWidth: i === 0 ? 1 : 0,
      borderColor: borderColor,
      opacity: opacity
    });
  }
};

// Enhanced separator with gradient effect
export const drawSeparator = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  opacity: number = 0.2
) => {
  // Draw subtle background highlight
  page.drawRectangle({
    x: x - 5,
    y: y - 2,
    width: width + 10,
    height: 4,
    color: COLOR.HIGHLIGHT,
    opacity: 0.3
  });
  
  // Draw main separator line
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 0.7,
    color: COLOR.SECONDARY,
    opacity: opacity
  });
  
  // Draw accent line at start
  page.drawLine({
    start: { x, y },
    end: { x: x + 40, y },
    thickness: 1.5,
    color: COLOR.PRIMARY,
    opacity: opacity + 0.3
  });
};

// Helper function to draw table rows with alternating colors
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
  }
  
  // Add subtle border effect
  page.drawLine({
    start: { x, y: y - height },
    end: { x: x + width, y: y - height },
    thickness: 0.5,
    color: COLOR.PRIMARY_LIGHT,
    opacity: 0.1
  });
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
    
    // Add page number at the bottom with more elegant styling
    const pageNumber = pdfDoc.getPageCount();
    
    // Draw footer background
    newPage.drawRectangle({
      x: 0,
      y: 0,
      width: width,
      height: 30,
      color: COLOR.BACKGROUND,
      opacity: 0.5
    });
    
    // Add page number
    newPage.drawText(`Página ${pageNumber}`, {
      x: width / 2 - 25,
      y: 15,
      size: 9,
      font: helveticaFont,
      color: COLOR.TEXT_LIGHT
    });
    
    // Add subtle corner decoration
    newPage.drawRectangle({
      x: width - 20,
      y: height - 20,
      width: 15,
      height: 15,
      color: COLOR.PRIMARY,
      opacity: 0.2
    });
    
    return { page: newPage, y: height - marginY };
  }
  
  return { page: currentPage, y: currentY };
};

// Enhanced section header with accent styling
export const drawSectionHeader = (
  page: PDFPage, 
  text: string,
  x: number,
  y: number,
  width: number,
  boldFont: PDFFont,
  size: number = 16
): number => {
  // Draw a background gradient effect
  const gradientSteps = 3;
  for (let i = 0; i < gradientSteps; i++) {
    const opacity = 0.1 - (i * 0.03);
    page.drawRectangle({
      x: x - 15,
      y: y - 8 + i,
      width: width + 30,
      height: size + 16 - (i * 2),
      color: COLOR.PRIMARY,
      borderWidth: 0,
      opacity: opacity
    });
  }
  
  // Draw modern accent line
  page.drawRectangle({
    x: x - 15,
    y: y - 8,
    width: 5,
    height: size + 16,
    color: COLOR.PRIMARY,
    borderWidth: 0,
  });
  
  // Draw the actual text
  page.drawText(text, {
    x: x,
    y: y,
    size: size,
    font: boldFont,
    color: COLOR.PRIMARY
  });
  
  // Draw subtle underline
  page.drawLine({
    start: { x: x, y: y - 5 },
    end: { x: x + boldFont.widthOfTextAtSize(text, size), y: y - 5 },
    thickness: 0.5,
    color: COLOR.TEXT_LIGHT,
    opacity: 0.3
  });
  
  return y - (size + 20); // Return new Y position after the header
};

// Improved header drawing function
export const drawHeader = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number,
  currentY: number,
  helveticaBold: PDFFont
): Promise<number> => {
  // Draw header background with gradient effect
  for (let i = 0; i < 4; i++) {
    const opacity = 1 - (i * 0.15);
    page.drawRectangle({
      x: 0,
      y: currentY - 60 + i,
      width: width,
      height: 60 - (i * 2),
      color: COLOR.SECONDARY,
      opacity: opacity
    });
  }
  
  // Draw modern accent bar with gradient
  for (let i = 0; i < 3; i++) {
    page.drawRectangle({
      x: 0,
      y: currentY - 60,
      width: width,
      height: 8 - i,
      color: COLOR.PRIMARY,
      opacity: 1 - (i * 0.2)
    });
  }
  
  // Carregar logo embutido para evitar problemas de rede
  try {
    // Fix: Usar método compatível com navegador em vez de Buffer
    const logoImageBytes = Uint8Array.from(atob(hostDimeLogoBase64), c => c.charCodeAt(0));
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    
    // Area branca para destacar o logo com sombra sutil
    for (let i = 0; i < 3; i++) {
      const shadowOffset = i;
      const shadowOpacity = 0.1 - (i * 0.03);
      page.drawRectangle({
        x: 50 + shadowOffset,
        y: currentY - 50 - shadowOffset,
        width: 140,
        height: 40,
        color: COLOR.SECONDARY,
        borderWidth: 0,
        opacity: shadowOpacity
      });
    }
    
    // Background branco para o logo
    page.drawRectangle({
      x: 50,
      y: currentY - 50,
      width: 140,
      height: 40,
      color: COLOR.WHITE,
      borderWidth: 0,
    });
    
    const logoWidth = 130;
    const logoHeight = logoWidth / (logoImage.width / logoImage.height);
    
    page.drawImage(logoImage, {
      x: 55,
      y: currentY - 45,
      width: logoWidth,
      height: logoHeight - 5
    });
  } catch (error) {
    console.error("Falha ao carregar logo:", error);
    // Fallback text melhorado se o logo não puder ser carregado
    page.drawRectangle({
      x: 40,
      y: currentY - 42,
      width: 160,
      height: 30,
      color: COLOR.PRIMARY,
      opacity: 0.9,
    });
    
    page.drawText("HostDime Brasil", {
      x: 50,
      y: currentY - 30,
      size: 20,
      font: helveticaBold,
      color: COLOR.WHITE
    });
  }
  
  return currentY - 70;
};
