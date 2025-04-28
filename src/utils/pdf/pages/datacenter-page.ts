
import { PDFPage, PDFFont, PDFDocument } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter } from '../utils';

export function addDataCenterPage(page: PDFPage, boldFont: PDFFont, font: PDFFont, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  const margin = PDFConfig.margins.default;
  let currentY = height - margin;
  
  // Título da página
  page.drawText("Nossos Data Centers", {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 40;
  
  // Data Center de João Pessoa
  page.drawText("Data Center Nordeste - João Pessoa", {
    x: margin,
    y: currentY,
    size: 18,
    font: boldFont,
    color: PDFColors.text
  });
  
  currentY -= 30;
  
  const jpFeatures = [
    "Certificação Tier III",
    "5.000m² de área total",
    "1MW de capacidade energética",
    "Redundância N+1 em todos os sistemas",
    "Conectividade com múltiplos provedores",
    "Sistema contra incêndio com gás FM-200",
    "Segurança física 24x7"
  ];
  
  for (const feature of jpFeatures) {
    page.drawText(`• ${feature}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text
    });
    currentY -= 20;
  }
  
  currentY -= 30;
  
  // Data Center de São Paulo
  page.drawText("Data Center São Paulo", {
    x: margin,
    y: currentY,
    size: 18,
    font: boldFont,
    color: PDFColors.text
  });
  
  currentY -= 30;
  
  const spFeatures = [
    "Localizado no maior hub de conectividade da América Latina",
    "Certificação Tier III",
    "Redundância 2N em energia e refrigeração",
    "Conectividade direta com PTT-SP",
    "Baixa latência para toda América do Sul",
    "Segurança avançada com biometria"
  ];
  
  for (const feature of spFeatures) {
    page.drawText(`• ${feature}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text
    });
    currentY -= 20;
  }
  
  currentY -= 30;
  
  // Diferenciais
  page.drawText("Diferenciais HostDime", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 30;
  
  const differentials = [
    "Suporte Técnico 24/7/365 em português",
    "Monitoramento proativo de todos os servidores",
    "Portal de gerenciamento exclusivo",
    "Atendimento personalizado com gerente de conta dedicado",
    "Flexibilidade para crescimento conforme necessidade"
  ];
  
  for (const diff of differentials) {
    page.drawText(`• ${diff}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text
    });
    currentY -= 20;
  }
  
  // Rodapé
  drawFooter(page, width, font);
  
  return page;
}
