import { PDFFont, PDFPage, RGB, PDFDocument, PDFImage } from 'pdf-lib';
import { PDFColors } from './constants';

export function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const width = font.widthOfTextAtSize(`${currentLine} ${word}`.trim(), fontSize);
    
    if (width < maxWidth) {
      currentLine = `${currentLine} ${word}`.trim();
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

export function drawFooter(page: any, pageWidth: number, font: PDFFont) {
  const footerY = 30;
  
  // Linha separadora
  page.drawLine({
    start: { x: 50, y: footerY + 15 },
    end: { x: pageWidth - 50, y: footerY + 15 },
    thickness: 1,
    color: PDFColors.muted,
  });
  
  // Texto do rodapé
  page.drawText("HostDime Brasil | www.hostdime.com.br | 0800 200 8532", {
    x: pageWidth / 2 - 150,
    y: footerY,
    size: 9,
    font,
    color: PDFColors.muted,
  });
}

// Updated function for drawing boxes - without rounded corners
export function drawRoundedBox(
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB,
  borderColor?: RGB,
  borderWidth: number = 1
) {
  // Draw the background rectangle
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color,
    borderColor,
    borderWidth
  });
  
  // Note: pdf-lib doesn't support borderRadius directly
  // To simulate rounded corners, we'd need to draw curves or multiple shapes
  // This is a simplified version without rounded corners
}

// Nova função para desenhar cabeçalhos de seção
export function drawSectionHeader(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  color: RGB = PDFColors.primary
) {
  page.drawText(text, {
    x,
    y,
    size: 16,
    font,
    color
  });
  
  // Linha decorativa abaixo do título
  page.drawLine({
    start: { x, y: y - 10 },
    end: { x: x + font.widthOfTextAtSize(text, 16) * 0.8, y: y - 10 },
    thickness: 2,
    color,
  });
}

// Função para desenhar listas com bullets
export function drawBulletList(
  page: PDFPage,
  items: string[],
  x: number,
  y: number,
  font: PDFFont,
  fontSize: number = 11,
  color: RGB = PDFColors.text,
  bulletIndent: number = 10,
  lineSpacing: number = 20
) {
  let currentY = y;
  
  for (const item of items) {
    // Desenhar o bullet
    page.drawText("•", {
      x,
      y: currentY,
      size: fontSize,
      font,
      color,
    });
    
    // Desenhar o texto do item
    page.drawText(item, {
      x: x + bulletIndent,
      y: currentY,
      size: fontSize,
      font,
      color,
    });
    
    currentY -= lineSpacing;
  }
  
  return currentY;
}

// Função para desenhar uma tabela simples
export function drawSimpleTable(
  page: PDFPage,
  headers: string[],
  rows: Array<string[]>,
  x: number,
  y: number,
  width: number,
  rowHeight: number,
  headerFont: PDFFont,
  bodyFont: PDFFont,
  fontSize: number = 10
) {
  const columnCount = headers.length;
  const columnWidth = width / columnCount;
  let currentY = y;
  
  // Desenhar cabeçalho
  page.drawRectangle({
    x,
    y: currentY - rowHeight,
    width,
    height: rowHeight,
    color: PDFColors.primary
  });
  
  headers.forEach((header, index) => {
    page.drawText(header, {
      x: x + (index * columnWidth) + 5,
      y: currentY - rowHeight/2 - 5,
      size: fontSize,
      font: headerFont,
      color: PDFColors.white
    });
  });
  
  currentY -= rowHeight;
  
  // Desenhar linhas
  let alternate = true;
  rows.forEach(row => {
    page.drawRectangle({
      x,
      y: currentY - rowHeight,
      width,
      height: rowHeight,
      color: alternate ? PDFColors.lightGray : PDFColors.white
    });
    
    row.forEach((cell, index) => {
      page.drawText(cell, {
        x: x + (index * columnWidth) + 5,
        y: currentY - rowHeight/2 - 5,
        size: fontSize,
        font: bodyFont,
        color: PDFColors.text
      });
    });
    
    currentY -= rowHeight;
    alternate = !alternate;
  });
  
  // Desenhar bordas da tabela
  page.drawRectangle({
    x,
    y: currentY,
    width,
    height: y - currentY,
    borderColor: PDFColors.muted,
    borderWidth: 1
  });
  
  // Desenhar linhas verticais
  for (let i = 1; i < columnCount; i++) {
    page.drawLine({
      start: { x: x + i * columnWidth, y },
      end: { x: x + i * columnWidth, y: currentY },
      thickness: 0.5,
      color: PDFColors.muted
    });
  }
  
  return currentY;
}

// Nova função para carregar e incorporar imagens como fundo de página
export async function embedPageBackground(
  pdfDoc: PDFDocument, 
  page: PDFPage, 
  imagePath: string,
  options: {
    opacity?: number;
    stretch?: boolean;
  } = { opacity: 1, stretch: true }
): Promise<void> {
  try {
    // Carregar a imagem do caminho especificado
    const imageResponse = await fetch(imagePath);
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    
    // Verificar a extensão do arquivo para decidir como incorporá-lo
    const extension = imagePath.split('.').pop()?.toLowerCase();
    
    let image: PDFImage;
    if (extension === 'jpg' || extension === 'jpeg') {
      image = await pdfDoc.embedJpg(imageArrayBuffer);
    } else if (extension === 'png') {
      image = await pdfDoc.embedPng(imageArrayBuffer);
    } else {
      throw new Error(`Formato de imagem não suportado: ${extension}`);
    }
    
    // Obter dimensões
    const { width, height } = page.getSize();
    const { width: imgWidth, height: imgHeight } = image;
    
    // Calcular proporções para manter aspect ratio
    let drawWidth = width;
    let drawHeight = height;
    
    if (!options.stretch) {
      // Manter proporção da imagem
      const scaleX = width / imgWidth;
      const scaleY = height / imgHeight;
      const scale = Math.min(scaleX, scaleY);
      
      drawWidth = imgWidth * scale;
      drawHeight = imgHeight * scale;
    }
    
    // Centralizar a imagem na página, se não estiver esticada
    const x = options.stretch ? 0 : (width - drawWidth) / 2;
    const y = options.stretch ? 0 : (height - drawHeight) / 2;
    
    // Desenhar a imagem com a opacidade especificada
    page.drawImage(image, {
      x,
      y,
      width: drawWidth,
      height: drawHeight,
      opacity: options.opacity
    });
  } catch (error) {
    console.error('Erro ao carregar imagem de fundo:', error);
    // Continuar sem a imagem de fundo em caso de erro
  }
}

// Nova função para posicionar texto com precisão absoluta
export function drawPositionedText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  font: PDFFont,
  size: number,
  options: {
    color?: RGB;
    opacity?: number;
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
  } = {}
) {
  const { 
    color = PDFColors.text, 
    opacity = 1, 
    align = 'left',
    maxWidth
  } = options;
  
  // Se temos largura máxima, precisamos quebrar o texto
  if (maxWidth) {
    const lines = wrapText(text, font, size, maxWidth);
    const lineHeight = size * 1.2; // 1.2 é um valor comum para espaçamento entre linhas
    
    lines.forEach((line, index) => {
      let xPos = x;
      
      // Ajustar posição baseado no alinhamento
      if (align === 'center') {
        const lineWidth = font.widthOfTextAtSize(line, size);
        xPos = x - (lineWidth / 2);
      } else if (align === 'right') {
        const lineWidth = font.widthOfTextAtSize(line, size);
        xPos = x - lineWidth;
      }
      
      page.drawText(line, {
        x: xPos,
        y: y - (index * lineHeight),
        size,
        font,
        color,
        opacity
      });
    });
  } else {
    // Texto sem quebra
    let xPos = x;
    
    // Ajustar posição baseado no alinhamento
    if (align === 'center') {
      const textWidth = font.widthOfTextAtSize(text, size);
      xPos = x - (textWidth / 2);
    } else if (align === 'right') {
      const textWidth = font.widthOfTextAtSize(text, size);
      xPos = x - textWidth;
    }
    
    page.drawText(text, {
      x: xPos,
      y,
      size,
      font,
      color,
      opacity
    });
  }
}

// Função para trabalhar com imagens no PDF (ícones, logos, etc)
export async function embedImage(
  pdfDoc: PDFDocument,
  page: PDFPage,
  imagePath: string,
  x: number,
  y: number,
  width: number,
  height?: number
): Promise<void> {
  try {
    // Carregar a imagem
    const imageResponse = await fetch(imagePath);
    const imageArrayBuffer = await imageResponse.arrayBuffer();
    
    // Verificar a extensão e carregar adequadamente
    const extension = imagePath.split('.').pop()?.toLowerCase();
    
    let image: PDFImage;
    if (extension === 'jpg' || extension === 'jpeg') {
      image = await pdfDoc.embedJpg(imageArrayBuffer);
    } else if (extension === 'png') {
      image = await pdfDoc.embedPng(imageArrayBuffer);
    } else {
      throw new Error(`Formato de imagem não suportado: ${extension}`);
    }
    
    // Calcular altura proporcional se não fornecida
    if (!height) {
      const aspectRatio = image.height / image.width;
      height = width * aspectRatio;
    }
    
    // Desenhar a imagem na página
    page.drawImage(image, {
      x,
      y,
      width,
      height
    });
  } catch (error) {
    console.error('Erro ao incorporar imagem:', error);
    // Continuar sem a imagem em caso de erro
  }
}
