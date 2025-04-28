import { PDFPage, PDFFont } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, wrapText } from '../utils';

export function addInstitutionalPage(page: PDFPage, boldFont: PDFFont, font: PDFFont) {
  const { width, height } = page.getSize();
  const margin = PDFConfig.margins.default;
  let currentY = height - margin;
  
  // Título da página
  page.drawText("Quem Somos", {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 40;
  
  // Texto institucional
  const institutionalText = "A HostDime é uma empresa global de data center e infraestrutura de nuvem com mais de 20 anos de experiência. Nossa missão é fornecer serviços de hospedagem e colocation de classe mundial com suporte técnico 24/7 em nossos data centers certificados.";
  
  const lines = wrapText(institutionalText, font, 11, width - 2 * margin);
  for (const line of lines) {
    page.drawText(line, {
      x: margin,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text
    });
    currentY -= 20;
  }
  
  currentY -= 20;
  
  // Seção de presença global
  page.drawText("Presença Global", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 30;
  
  // Lista de países (simulando o mapa)
  const countries = [
    "Brasil - Data Centers em São Paulo e João Pessoa",
    "Estados Unidos - Data Center em Orlando, Flórida",
    "Colômbia - Data Center em Bogotá",
    "México - Data Center na Cidade do México",
    "Holanda - Data Center em Amsterdam"
  ];
  
  for (const country of countries) {
    page.drawText(`• ${country}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text
    });
    currentY -= 20;
  }
  
  currentY -= 30;
  
  // Certificações
  page.drawText("Certificações", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 30;
  
  const certifications = [
    "ISO 27001 - Segurança da Informação",
    "PCI DSS - Segurança de Dados do Cartão de Pagamento",
    "ISAE 3402/SOC 1 Type II",
    "Uptime Institute Tier III"
  ];
  
  for (const cert of certifications) {
    page.drawText(`• ${cert}`, {
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
}
