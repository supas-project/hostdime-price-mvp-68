
import { PDFPage, PDFFont, PDFDocument } from 'pdf-lib';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, wrapText, embedPageBackground, drawPositionedText, embedImage } from '../utils';

export async function addContactPage(page: PDFPage, boldFont: PDFFont, font: PDFFont, italicFont: PDFFont, pdfDoc: PDFDocument) {
  const { width, height } = page.getSize();
  const margin = PDFConfig.margins.default;
  
  // Adicionar imagem de fundo da página de contato
  await embedPageBackground(pdfDoc, page, PDFConfig.templates.pages.contact, {
    stretch: true
  });
  
  // Título da página
  drawPositionedText(
    page,
    "Entre em Contato",
    margin,
    height - margin,
    boldFont,
    24,
    { color: PDFColors.primary }
  );
  
  let currentY = height - margin - 40;
  
  // Texto sobre contato
  const contactText = "Estamos à disposição para esclarecer quaisquer dúvidas sobre esta proposta e adaptar nossa solução às necessidades específicas do seu negócio.";
  
  const lines = wrapText(contactText, font, 11, width - 2 * margin);
  for (const line of lines) {
    drawPositionedText(
      page,
      line,
      margin,
      currentY,
      font,
      11,
      { color: PDFColors.text }
    );
    currentY -= 20;
  }
  
  currentY -= 30;
  
  // Informações de contato
  drawPositionedText(
    page,
    "Contatos",
    margin,
    currentY,
    boldFont,
    16,
    { color: PDFColors.primary }
  );
  
  currentY -= 30;
  
  const contacts = [
    { label: "Telefone:", value: "+55 (83) 3512-3100" },
    { label: "E-mail:", value: "vendas@hostdime.com.br" },
    { label: "Website:", value: "www.hostdime.com.br" },
    { label: "Endereço:", value: "Avenida João Cirilo da Silva, 1901 - Altiplano, João Pessoa - PB" }
  ];
  
  for (const contact of contacts) {
    // Label
    drawPositionedText(
      page,
      contact.label,
      margin,
      currentY,
      boldFont,
      11,
      { color: PDFColors.text }
    );
    
    // Value
    drawPositionedText(
      page,
      contact.value,
      margin + 80,
      currentY,
      font,
      11,
      { color: PDFColors.text }
    );
    
    currentY -= 20;
  }
  
  currentY -= 50;
  
  // Texto de agradecimento
  drawPositionedText(
    page,
    "Agradecemos a oportunidade de apresentar nossa proposta",
    width / 2,
    currentY,
    boldFont,
    12,
    {
      color: PDFColors.primary,
      align: 'center'
    }
  );
  
  currentY -= 20;
  
  drawPositionedText(
    page,
    "HostDime Brasil - Soluções em Infraestrutura de Data Center",
    width / 2,
    currentY,
    italicFont,
    12,
    {
      color: PDFColors.text,
      align: 'center'
    }
  );
  
  // Rodapé
  drawFooter(page, width, font);
  
  return page;
}
