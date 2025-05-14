
import { PDFDocument, PDFImage, PDFPage, PDFFont } from 'pdf-lib';
import { hostDimeLogoBase64 } from '../../pdf-assets';

export async function embeddedImage(doc: PDFDocument, base64Image: string) {
  try {
    // Melhor tratamento de erros para evitar quebras no documento
    if (!base64Image || base64Image.trim() === '') {
      console.warn("Base64 image is empty");
      return null;
    }
    
    // Corrigido para usar embedJpg
    return await doc.embedJpg(base64Image);
  } catch (error) {
    console.error("Error embedding image:", error);
    // Em vez de jogar o erro, retornamos null para tratamento gracioso
    return null;
  }
}

export async function embedHostDimeLogo(doc: PDFDocument) {
  try {
    return await embeddedImage(doc, hostDimeLogoBase64);
  } catch (error) {
    console.error("Failed to embed HostDime logo:", error);
    // Não lançamos o erro para evitar quebrar a geração do PDF
    return null;
  }
}

export async function embedCustomerLogo(doc: PDFDocument, logoBase64?: string) {
  if (!logoBase64) {
    return null;
  }
  
  try {
    return await embeddedImage(doc, logoBase64);
  } catch (error) {
    console.error("Failed to embed customer logo:", error);
    return null;
  }
}

export function calculateImageDimensions(
  originalWidth: number, 
  originalHeight: number, 
  maxWidth: number, 
  maxHeight: number
) {
  // Calculate aspect ratio
  const aspectRatio = originalWidth / originalHeight;
  
  // Start with maximum dimensions
  let width = maxWidth;
  let height = maxHeight;
  
  // Adjust dimensions to maintain aspect ratio
  if (width / height > aspectRatio) {
    // Height is the limiting factor
    width = height * aspectRatio;
  } else {
    // Width is the limiting factor
    height = width / aspectRatio;
  }
  
  return { width, height };
}

// Função melhorada para incorporar e desenhar imagem com tratamento de erros robusto
export async function embedAndDrawImage(
  pdfDoc: PDFDocument,
  page: PDFPage, 
  imageBytes: Uint8Array,
  dimensions: { x: number, y: number, width: number, height: number },
  fallbackText: string,
  font: PDFFont
) {
  try {
    // Verificar se os bytes são válidos
    if (!imageBytes || imageBytes.length === 0) {
      throw new Error("Image data is empty");
    }
    
    // Try to embed the image
    let image;
    try {
      image = await pdfDoc.embedJpg(imageBytes);
    } catch (jpgError) {
      // Se falhar como JPG, tente como PNG
      try {
        image = await pdfDoc.embedPng(imageBytes);
      } catch (pngError) {
        // Se ambos falharem, use o texto de fallback
        throw new Error("Failed to embed as JPG or PNG");
      }
    }
    
    // Se chegou aqui, temos uma imagem válida
    page.drawImage(image, {
      x: dimensions.x,
      y: dimensions.y - dimensions.height,
      width: dimensions.width,
      height: dimensions.height
    });
    
    return true;
  } catch (error) {
    console.error("Failed to embed image:", error);
    
    // Fallback: draw text instead
    page.drawText(fallbackText, {
      x: dimensions.x,
      y: dimensions.y - dimensions.height / 2,
      font,
      size: 12
    });
    
    return false;
  }
}
