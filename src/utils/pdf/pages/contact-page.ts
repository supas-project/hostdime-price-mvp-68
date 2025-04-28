
import { PDFPage, PDFFont, PDFDocument } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, wrapText } from '../utils';

export function addContactPage(page: PDFPage, boldFont: PDFFont, font: PDFFont, italicFont: PDFFont, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  const margin = PDFConfig.margins.default;
  let currentY = height - margin;
  
  // Título da página
  page.drawText("Entre em Contato", {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 40;
  
  // Texto sobre contato
  const contactText = "Estamos à disposição para esclarecer quaisquer dúvidas sobre esta proposta e adaptar nossa solução às necessidades específicas do seu negócio.";
  
  const lines = wrapText(contactText, font, 11, width - 2 * margin);
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
  
  currentY -= 30;
  
  // Informações de contato
  page.drawText("Contatos", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 30;
  
  const contacts = [
    { label: "Telefone:", value: "+55 (83) 3512-3100" },
    { label: "E-mail:", value: "vendas@hostdime.com.br" },
    { label: "Website:", value: "www.hostdime.com.br" },
    { label: "Endereço:", value: "Avenida João Cirilo da Silva, 1901 - Altiplano, João Pessoa - PB" }
  ];
  
  for (const contact of contacts) {
    page.drawText(contact.label, {
      x: margin,
      y: currentY,
      size: 11,
      font: boldFont,
      color: PDFColors.text,
    });
    
    page.drawText(contact.value, {
      x: margin + 80,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text,
    });
    
    currentY -= 20;
  }
  
  currentY -= 50;
  
  // Texto de agradecimento
  page.drawText("Agradecemos a oportunidade de apresentar nossa proposta", {
    x: width / 2 - 180,
    y: currentY,
    size: 12,
    font: boldFont,
    color: PDFColors.primary
  });
  
  currentY -= 20;
  
  page.drawText("HostDime Brasil - Soluções em Infraestrutura de Data Center", {
    x: width / 2 - 180,
    y: currentY,
    size: 12,
    font: italicFont,
    color: PDFColors.text
  });
  
  // Rodapé
  drawFooter(page, width, font);
  
  return page;
}
