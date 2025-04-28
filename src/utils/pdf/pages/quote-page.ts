
import { PDFPage, PDFFont, PDFDocument, rgb } from 'pdf-lib';
import { ComponentOption } from '@/types/component';
import { formatCurrency } from '@/lib/utils';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter, embedPageBackground, drawPositionedText } from '../utils';

export async function addQuotePage(
  page: PDFPage,
  selectedComponents: { [key: string]: ComponentOption },
  margin: number,
  boldFont: PDFFont,
  font: PDFFont,
  italicFont: PDFFont,
  pdfDoc: PDFDocument
) {
  const { width, height } = page.getSize();
  const margin_x = PDFConfig.margins.default;
  
  // Adicionar imagem de fundo da página de cotação
  await embedPageBackground(pdfDoc, page, PDFConfig.templates.pages.quote, {
    stretch: true
  });
  
  let currentY = height - margin_x - 20;

  // Cabeçalho
  drawPositionedText(
    page,
    "Proposta Comercial - Servidor Dedicado",
    margin_x,
    currentY,
    boldFont,
    PDFConfig.fontSize.title,
    { color: PDFColors.primary }
  );

  currentY -= 30;
  
  // Data atual
  drawPositionedText(
    page,
    `Data: ${new Date().toLocaleDateString('pt-BR')}`,
    margin_x,
    currentY,
    font,
    12,
    { color: PDFColors.muted }
  );
  
  currentY -= 50;
  
  // Especificações Técnicas
  drawPositionedText(
    page,
    "Especificações Técnicas",
    margin_x,
    currentY,
    boldFont,
    16,
    { color: PDFColors.text }
  );
  
  currentY -= 20;
  
  // Desenhar tabela de componentes
  const tableTop = currentY;
  const tableWidth = width - 2 * margin_x;
  const colWidths = [0.35 * tableWidth, 0.5 * tableWidth, 0.15 * tableWidth];
  const rowHeight = 30; 

  // Cabeçalho da tabela com fundo colorido
  page.drawRectangle({
    x: margin_x,
    y: currentY - rowHeight,
    width: tableWidth,
    height: rowHeight,
    color: PDFColors.primary
  });
  
  // Cabeçalhos da tabela
  drawPositionedText(
    page,
    "Componente",
    margin_x + 5,
    currentY - rowHeight/2,
    boldFont,
    12,
    { color: PDFColors.white }
  );
  
  drawPositionedText(
    page,
    "Especificação",
    margin_x + colWidths[0] + 5,
    currentY - rowHeight/2,
    boldFont,
    12,
    { color: PDFColors.white }
  );
  
  drawPositionedText(
    page,
    "Valor Mensal",
    margin_x + colWidths[0] + colWidths[1] + 5,
    currentY - rowHeight/2,
    boldFont,
    12,
    { color: PDFColors.white }
  );
  
  currentY -= rowHeight;

  // Corpo da tabela com cores alternadas
  let rowColor = true;
  for (const [key, component] of Object.entries(selectedComponents)) {
    // Fundo alternado das linhas
    page.drawRectangle({
      x: margin_x,
      y: currentY - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rowColor ? PDFColors.lightGray : PDFColors.white
    });
    
    // Nome do componente
    drawPositionedText(
      page,
      component.name,
      margin_x + 5,
      currentY - rowHeight/2,
      boldFont,
      10,
      { color: PDFColors.text }
    );
    
    // Descrição/especificação
    drawPositionedText(
      page,
      component.description || "",
      margin_x + colWidths[0] + 5,
      currentY - rowHeight/2,
      font,
      10,
      { color: PDFColors.text }
    );
    
    // Preço
    drawPositionedText(
      page,
      formatCurrency(component.price || 0),
      margin_x + colWidths[0] + colWidths[1] + 5,
      currentY - rowHeight/2,
      font,
      10,
      { color: PDFColors.text }
    );
    
    currentY -= rowHeight;
    rowColor = !rowColor;
    
    // Verificar se precisa de quebra de página
    if (currentY < 200) {
      // Desenhar o rodapé na página atual
      drawFooter(page, width, font);
      
      // Criar nova página
      const newPage = pdfDoc.addPage([PDFConfig.pageSize.width, PDFConfig.pageSize.height]);
      
      // Adicionar template de fundo na nova página
      await embedPageBackground(pdfDoc, newPage, PDFConfig.templates.pages.quote, {
        stretch: true
      });
      
      const newPageSize = newPage.getSize();
      currentY = newPageSize.height - 80;
      
      // Continuar cabeçalho na nova página
      drawPositionedText(
        newPage,
        "Especificações Técnicas (continuação)",
        margin_x,
        currentY,
        boldFont,
        16,
        { color: PDFColors.text }
      );
      
      currentY -= 30;
      
      // Atualizar a referência da página atual
      page = newPage;
    }
  }
  
  // Desenhar bordas da tabela
  page.drawLine({
    start: { x: margin_x, y: tableTop },
    end: { x: margin_x + tableWidth, y: tableTop },
    thickness: 1,
    color: PDFColors.primary,
  });
  
  page.drawLine({
    start: { x: margin_x, y: currentY },
    end: { x: margin_x + tableWidth, y: currentY },
    thickness: 1,
    color: PDFColors.primary,
  });
  
  page.drawLine({
    start: { x: margin_x, y: tableTop },
    end: { x: margin_x, y: currentY },
    thickness: 1,
    color: PDFColors.primary,
  });
  
  page.drawLine({
    start: { x: margin_x + tableWidth, y: tableTop },
    end: { x: margin_x + tableWidth, y: currentY },
    thickness: 1,
    color: PDFColors.primary,
  });
  
  // Linhas verticais internas
  page.drawLine({
    start: { x: margin_x + colWidths[0], y: tableTop },
    end: { x: margin_x + colWidths[0], y: currentY },
    thickness: 0.5,
    color: PDFColors.muted,
  });
  
  page.drawLine({
    start: { x: margin_x + colWidths[0] + colWidths[1], y: tableTop },
    end: { x: margin_x + colWidths[0] + colWidths[1], y: currentY },
    thickness: 0.5,
    color: PDFColors.muted,
  });
  
  currentY -= 40;
  
  // Resumo Financeiro
  drawPositionedText(
    page,
    "Resumo Financeiro",
    margin_x,
    currentY,
    boldFont,
    16,
    { color: PDFColors.text }
  );
  
  currentY -= 30;
  
  // Cálculos financeiros
  const subtotal = Object.values(selectedComponents).reduce(
    (sum, component) => sum + (component.price || 0),
    0
  );
  const profit = (subtotal * margin) / 100;
  const total = subtotal + profit;
  
  // Box para o resumo financeiro
  page.drawRectangle({
    x: width - margin_x - 250,
    y: currentY - 100,
    width: 250,
    height: 100,
    borderColor: PDFColors.primary,
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98)
  });
  
  // Subtotal
  drawPositionedText(
    page,
    "Subtotal:",
    width - margin_x - 240,
    currentY - 25,
    font,
    12,
    { color: PDFColors.text }
  );
  
  drawPositionedText(
    page,
    formatCurrency(subtotal),
    width - margin_x - 80,
    currentY - 25,
    boldFont,
    12,
    { color: PDFColors.text }
  );
  
  // Margem
  drawPositionedText(
    page,
    `Margem (${margin}%):`,
    width - margin_x - 240,
    currentY - 50,
    font,
    12,
    { color: PDFColors.text }
  );
  
  drawPositionedText(
    page,
    formatCurrency(profit),
    width - margin_x - 80,
    currentY - 50,
    boldFont,
    12,
    { color: PDFColors.primary }
  );
  
  // Linha separadora
  page.drawLine({
    start: { x: width - margin_x - 240, y: currentY - 60 },
    end: { x: width - margin_x - 10, y: currentY - 60 },
    thickness: 1,
    color: PDFColors.muted,
  });
  
  // Total
  drawPositionedText(
    page,
    "Total Mensal:",
    width - margin_x - 240,
    currentY - 85,
    boldFont,
    14,
    { color: PDFColors.text }
  );
  
  drawPositionedText(
    page,
    formatCurrency(total),
    width - margin_x - 80,
    currentY - 85,
    boldFont,
    14,
    { color: PDFColors.primary }
  );
  
  // Condições comerciais
  currentY -= 140;
  
  drawPositionedText(
    page,
    "Condições Comerciais",
    margin_x,
    currentY,
    boldFont,
    16,
    { color: PDFColors.text }
  );
  
  currentY -= 30;
  
  const conditions = [
    { label: "Validade da proposta:", value: "15 dias" },
    { label: "Prazo mínimo de contrato:", value: "12 meses" },
    { label: "Forma de pagamento:", value: "Boleto bancário, cartão de crédito ou PIX" },
    { label: "Prazo de ativação:", value: "Até 24 horas após confirmação do pagamento" }
  ];
  
  for (const condition of conditions) {
    // Label
    drawPositionedText(
      page,
      condition.label,
      margin_x,
      currentY,
      boldFont,
      11,
      { color: PDFColors.text }
    );
    
    // Value
    drawPositionedText(
      page,
      condition.value,
      margin_x + 180,
      currentY,
      font,
      11,
      { color: PDFColors.text }
    );
    
    currentY -= 20;
  }
  
  drawFooter(page, width, font);
  
  // Return the page in case we created a new one
  return page;
}
