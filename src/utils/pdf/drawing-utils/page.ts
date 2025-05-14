
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
    
    // Draw footer with modern design
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
    
    // Add HostDime orange top border
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

// Improved header drawing function with enhanced HostDime branding
export const drawHeader = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number,
  currentY: number,
  helveticaBold: PDFFont
): Promise<number> => {
  // CORREÇÃO: Ampliando a altura do cabeçalho para melhor visualização
  const headerHeight = 70; // Aumentado para dar mais espaço
  
  // Draw header background with HostDime orange - CORREÇÃO: Ajuste de posicionamento
  page.drawRectangle({
    x: 0,
    y: currentY - headerHeight + 10,
    width: width,
    height: headerHeight,
    color: COLOR.PRIMARY,
    opacity: 1
  });
  
  // Draw dark secondary color accent
  page.drawRectangle({
    x: 0,
    y: currentY - headerHeight - 4 + 10,
    width: width,
    height: 4,
    color: COLOR.SECONDARY,
    borderWidth: 0
  });
  
  try {
    // CORREÇÃO: Ajustando posicionamento e tamanho do logo
    const logoImageBytes = Uint8Array.from(atob(hostDimeLogoBase64), c => c.charCodeAt(0));
    
    // Ajustando a posição do retângulo branco para o logo
    page.drawRectangle({
      x: 50,
      y: currentY - headerHeight + 15,
      width: 180, // Aumentado para melhor visualização
      height: 50, // Aumentado para melhor visualização
      color: COLOR.WHITE,
      borderWidth: 0,
      opacity: 1
    });
    
    // CORREÇÃO: Ajustando o posicionamento do logo
    const logoEmbedded = await embedAndDrawImage(
      pdfDoc,
      page,
      logoImageBytes,
      {
        x: 60, // Ligeiramente ajustado para centralizar no retângulo branco
        y: currentY - 10,
        width: 160, // Ajustado para melhor proporção
        height: 50  // Ajustado para melhor proporção
      },
      "HostDime Brasil",
      helveticaBold
    );
    
  } catch (error) {
    console.error("Falha ao carregar logo:", error);
    // Draw text fallback
    page.drawText("HostDime Brasil", {
      x: 80,
      y: currentY - 30,
      size: 20, // Aumentado para melhor visualização
      font: helveticaBold,
      color: COLOR.WHITE
    });
  }
  
  // CORREÇÃO: Retornando mais espaço para evitar sobreposição com a seção seguinte
  return currentY - (headerHeight + 10);
};
