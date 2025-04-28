
import { PDFPage, PDFFont, PDFDocument } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, embedPageBackground, drawPositionedText, embedImage } from '../utils';

export async function addCoverPage(page: PDFPage, boldFont: PDFFont, font: PDFFont, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  
  // Adicionar imagem de fundo da capa
  await embedPageBackground(pdfDoc, page, PDFConfig.templates.pages.cover, {
    stretch: true,
    opacity: 1
  });

  // Data da proposta
  const today = new Date().toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Posicionamento na metade inferior da página
  drawPositionedText(
    page,
    "PROPOSTA COMERCIAL",
    width / 2,
    height * 0.4,
    boldFont,
    32,
    {
      color: PDFColors.white,
      align: 'center'
    }
  );
  
  // Data da proposta
  drawPositionedText(
    page,
    today,
    width / 2,
    height * 0.34,
    font,
    14,
    {
      color: PDFColors.white,
      align: 'center'
    }
  );
  
  // Slogan na parte inferior
  drawPositionedText(
    page,
    "ABRA ESPAÇO PARA A INOVAÇÃO",
    width / 2,
    height * 0.15,
    boldFont,
    18,
    {
      color: PDFColors.white,
      align: 'center'
    }
  );

  drawFooter(page, width, font);
  
  return page;
}
