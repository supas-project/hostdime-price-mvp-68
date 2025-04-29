
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
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color: color,
    borderWidth: 1,
    borderColor: borderColor,
    opacity: 0.7
  });
};

// Enhanced separator with gradient effect
export const drawSeparator = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  opacity: number = 0.2
) => {
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
    end: { x: x + 30, y },
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
    newPage.drawText(`Página ${pageNumber}`, {
      x: width / 2 - 20,
      y: 30,
      size: 10,
      font: helveticaFont,
      color: COLOR.TEXT_LIGHT
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
  // Draw a rectangle with the primary color
  page.drawRectangle({
    x: x - 10,
    y: y - 5,
    width: width + 20,
    height: size + 10,
    color: COLOR.PRIMARY,
    borderWidth: 0,
    opacity: 0.1
  });
  
  // Draw accent line
  page.drawRectangle({
    x: x - 10,
    y: y - 5,
    width: 5,
    height: size + 10,
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
  
  return y - (size + 15); // Return new Y position after the header
};

// Improved header drawing function
export const drawHeader = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number,
  currentY: number,
  helveticaBold: PDFFont
): Promise<number> => {
  // Draw header background
  page.drawRectangle({
    x: 0,
    y: currentY - 60,
    width: width,
    height: 60,
    color: COLOR.SECONDARY
  });
  
  // Draw orange accent line
  page.drawRectangle({
    x: 0,
    y: currentY - 60,
    width: width,
    height: 8,
    color: COLOR.PRIMARY
  });
  
  // Carregar logo embutido para evitar problemas de rede
  try {
    // Usar a imagem em Base64 em vez de buscar da internet
    const logoImageBytes = Buffer.from(hostDimeLogoBase64, 'base64');
    const logoImage = await pdfDoc.embedPng(logoImageBytes);
    
    // Area branca para destacar o logo
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
