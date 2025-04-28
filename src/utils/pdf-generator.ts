
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";

export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
): Promise<Uint8Array> {
  // Criar um novo documento PDF
  const pdfDoc = await PDFDocument.create();
  
  // Adicionar uma nova página
  const page = pdfDoc.addPage([595.276, 841.890]); // Tamanho A4
  
  // Carregar a fonte
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Cores
  const primaryColor = rgb(0.96, 0.51, 0.13); // #f58220
  const textColor = rgb(0.12, 0.12, 0.12); // #1e1e1e
  const mutedColor = rgb(0.4, 0.4, 0.4); // text-muted

  // Configurações de página
  const { width, height } = page.getSize();
  const margin_x = 50;
  const startY = height - 50;
  let currentY = startY;
  
  // Cabeçalho
  page.drawText('Cotação de Servidor Dedicado', {
    x: margin_x,
    y: currentY,
    size: 24,
    font: boldFont,
    color: primaryColor,
  });
  
  currentY -= 30;
  
  page.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
    x: margin_x,
    y: currentY,
    size: 12,
    font,
    color: mutedColor,
  });
  
  currentY -= 50;
  
  // Especificações Técnicas
  page.drawText('Especificações Técnicas', {
    x: margin_x,
    y: currentY,
    size: 16,
    font: boldFont,
    color: textColor,
  });
  
  currentY -= 20;
  
  // Lista de componentes
  for (const component of Object.values(selectedComponents)) {
    currentY -= 25;
    
    page.drawText(`${component.name}`, {
      x: margin_x,
      y: currentY,
      size: 12,
      font: boldFont,
      color: textColor,
    });
    
    currentY -= 20;
    
    page.drawText(component.description || '', {
      x: margin_x + 10,
      y: currentY,
      size: 10,
      font,
      color: textColor,
    });
    
    if (component.specs) {
      for (const spec of component.specs) {
        currentY -= 15;
        page.drawText(`• ${spec}`, {
          x: margin_x + 20,
          y: currentY,
          size: 10,
          font,
          color: mutedColor,
        });
      }
    }
    
    currentY -= 10;
  }
  
  currentY -= 40;
  
  // Resumo Financeiro
  page.drawText('Resumo Financeiro', {
    x: margin_x,
    y: currentY,
    size: 16,
    font: boldFont,
    color: textColor,
  });
  
  currentY -= 30;
  
  // Cálculos financeiros
  const subtotal = Object.values(selectedComponents).reduce(
    (sum, component) => sum + component.price,
    0
  );
  const profit = (subtotal * margin) / 100;
  const total = subtotal + profit;
  
  // Subtotal
  page.drawText('Subtotal:', {
    x: margin_x,
    y: currentY,
    size: 12,
    font,
    color: textColor,
  });
  
  page.drawText(formatCurrency(subtotal), {
    x: width - margin_x - 100,
    y: currentY,
    size: 12,
    font: boldFont,
    color: textColor,
  });
  
  currentY -= 20;
  
  // Margem
  page.drawText(`Margem (${margin}%):`, {
    x: margin_x,
    y: currentY,
    size: 12,
    font,
    color: textColor,
  });
  
  page.drawText(formatCurrency(profit), {
    x: width - margin_x - 100,
    y: currentY,
    size: 12,
    font: boldFont,
    color: primaryColor,
  });
  
  currentY -= 30;
  
  // Total
  page.drawText('Total Mensal:', {
    x: margin_x,
    y: currentY,
    size: 14,
    font: boldFont,
    color: textColor,
  });
  
  page.drawText(formatCurrency(total), {
    x: width - margin_x - 100,
    y: currentY,
    size: 14,
    font: boldFont,
    color: primaryColor,
  });
  
  // Rodapé
  currentY -= 60;
  
  const footerText = [
    'Para mais informações, entre em contato com nossa equipe.',
    'HostDime Brasil - Soluções em Hospedagem'
  ];
  
  for (const text of footerText) {
    page.drawText(text, {
      x: width / 2 - font.widthOfTextAtSize(text, 10) / 2,
      y: currentY,
      size: 10,
      font,
      color: mutedColor,
    });
    currentY -= 20;
  }
  
  // Gerar o PDF
  return pdfDoc.save();
}
