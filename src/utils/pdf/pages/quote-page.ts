import { PDFPage, PDFFont } from 'pdf-lib';
import { ComponentOption } from '@/types/component';
import { formatCurrency } from '@/lib/utils';
import { PDFColors, PDFConfig } from '../constants';
import { drawFooter } from '../utils';

export function addQuotePage(
  page: PDFPage,
  selectedComponents: { [key: string]: ComponentOption },
  margin: number,
  boldFont: PDFFont,
  font: PDFFont,
  italicFont: PDFFont
) {
  const { width, height } = page.getSize();
  const margin_x = PDFConfig.margins.default;
  let currentY = height - 80;

  // Cabeçalho
  page.drawText("Proposta Comercial - Servidor Dedicado", {
    x: margin_x,
    y: currentY,
    size: PDFConfig.fontSize.title,
    font: boldFont,
    color: PDFColors.primary
  });

  currentY -= 30;
  
  page.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
    x: margin_x,
    y: currentY,
    size: 12,
    font,
    color: PDFColors.muted,
  });
  
  currentY -= 50;
  
  // Especificações Técnicas
  page.drawText("Especificações Técnicas", {
    x: margin_x,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PDFColors.text,
  });
  
  currentY -= 20;
  
  // Desenhar tabela de componentes
  const tableTop = currentY;
  const tableWidth = width - 2 * margin_x;
  const colWidths = [0.35 * tableWidth, 0.5 * tableWidth, 0.15 * tableWidth];
  const rowHeight = 30; // Aumentado para melhor espaçamento

  // Cabeçalho da tabela com fundo colorido
  page.drawRectangle({
    x: margin_x,
    y: currentY - rowHeight,
    width: tableWidth,
    height: rowHeight,
    color: PDFColors.primary
  });
  
  page.drawText("Componente", {
    x: margin_x + 5,
    y: currentY - rowHeight/2 - 5,
    size: 12,
    font: boldFont,
    color: PDFColors.white,
  });
  
  page.drawText("Especificação", {
    x: margin_x + colWidths[0] + 5,
    y: currentY - rowHeight/2 - 5,
    size: 12,
    font: boldFont,
    color: PDFColors.white,
  });
  
  page.drawText("Valor Mensal", {
    x: margin_x + colWidths[0] + colWidths[1] + 5,
    y: currentY - rowHeight/2 - 5,
    size: 12,
    font: boldFont,
    color: PDFColors.white,
  });
  
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
    page.drawText(component.name, {
      x: margin_x + 5,
      y: currentY - rowHeight/2 - 5,
      size: 10,
      font: boldFont,
      color: PDFColors.text,
    });
    
    // Descrição/especificação
    page.drawText(component.description || "", {
      x: margin_x + colWidths[0] + 5,
      y: currentY - rowHeight/2 - 5,
      size: 10,
      font,
      color: PDFColors.text,
    });
    
    // Preço
    page.drawText(formatCurrency(component.price || 0), {
      x: margin_x + colWidths[0] + colWidths[1] + 5,
      y: currentY - rowHeight/2 - 5,
      size: 10,
      font,
      color: PDFColors.text,
    });
    
    currentY -= rowHeight;
    rowColor = !rowColor;
    
    // Verificar se precisa de quebra de página
    if (currentY < 200) {
      // Desenhar o rodapé na página atual
      drawFooter(page, width, font);
      
      // Criar nova página
      page = pdfDoc.addPage([595.276, 841.890]);
      const newPageSize = page.getSize();
      currentY = newPageSize.height - 80;
      
      // Continuar cabeçalho na nova página
      page.drawText("Especificações Técnicas (continuação)", {
        x: margin_x,
        y: currentY,
        size: 16,
        font: boldFont,
        color: PDFColors.text,
      });
      
      currentY -= 30;
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
  page.drawText("Resumo Financeiro", {
    x: margin_x,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PDFColors.text,
  });
  
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
  page.drawText("Subtotal:", {
    x: width - margin_x - 240,
    y: currentY - 25,
    size: 12,
    font,
    color: PDFColors.text,
  });
  
  page.drawText(formatCurrency(subtotal), {
    x: width - margin_x - 80,
    y: currentY - 25,
    size: 12,
    font: boldFont,
    color: PDFColors.text,
  });
  
  // Margem
  page.drawText(`Margem (${margin}%):`, {
    x: width - margin_x - 240,
    y: currentY - 50,
    size: 12,
    font,
    color: PDFColors.text,
  });
  
  page.drawText(formatCurrency(profit), {
    x: width - margin_x - 80,
    y: currentY - 50,
    size: 12,
    font: boldFont,
    color: PDFColors.primary,
  });
  
  // Linha separadora
  page.drawLine({
    start: { x: width - margin_x - 240, y: currentY - 60 },
    end: { x: width - margin_x - 10, y: currentY - 60 },
    thickness: 1,
    color: PDFColors.muted,
  });
  
  // Total
  page.drawText("Total Mensal:", {
    x: width - margin_x - 240,
    y: currentY - 85,
    size: 14,
    font: boldFont,
    color: PDFColors.text,
  });
  
  page.drawText(formatCurrency(total), {
    x: width - margin_x - 80,
    y: currentY - 85,
    size: 14,
    font: boldFont,
    color: PDFColors.primary,
  });
  
  // Condições comerciais
  currentY -= 140;
  
  page.drawText("Condições Comerciais", {
    x: margin_x,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PDFColors.text,
  });
  
  currentY -= 30;
  
  const conditions = [
    { label: "Validade da proposta:", value: "15 dias" },
    { label: "Prazo mínimo de contrato:", value: "12 meses" },
    { label: "Forma de pagamento:", value: "Boleto bancário, cartão de crédito ou PIX" },
    { label: "Prazo de ativação:", value: "Até 24 horas após confirmação do pagamento" }
  ];
  
  for (const condition of conditions) {
    page.drawText(condition.label, {
      x: margin_x,
      y: currentY,
      size: 11,
      font: boldFont,
      color: PDFColors.text,
    });
    
    page.drawText(condition.value, {
      x: margin_x + 180,
      y: currentY,
      size: 11,
      font,
      color: PDFColors.text,
    });
    
    currentY -= 20;
  }
  
  drawFooter(page, width, font);
}
