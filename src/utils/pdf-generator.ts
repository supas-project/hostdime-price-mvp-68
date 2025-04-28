
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";

export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
): Promise<Uint8Array> {
  try {
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.276, 841.890]); // A4 size
    
    // Load fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    const marginX = 50;
    let currentY = height - marginX;
    
    // Title
    page.drawText("Proposta Comercial - Servidor Dedicado", {
      x: marginX,
      y: currentY,
      size: 24,
      font: boldFont,
      color: rgb(0.96, 0.51, 0.13) // #f58220
    });
    
    currentY -= 30;
    
    // Date
    page.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
      x: marginX,
      y: currentY,
      size: 12,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    currentY -= 50;
    
    // Components Table Header
    const tableWidth = width - 2 * marginX;
    const colWidths = [0.4 * tableWidth, 0.4 * tableWidth, 0.2 * tableWidth];
    const rowHeight = 30;
    
    // Draw table header
    page.drawRectangle({
      x: marginX,
      y: currentY - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    ['Componente', 'Especificação', 'Valor Mensal'].forEach((header, index) => {
      const x = marginX + (index > 0 ? colWidths.slice(0, index).reduce((a, b) => a + b, 0) : 0) + 10;
      page.drawText(header, {
        x,
        y: currentY - rowHeight/2 - 6,
        size: 12,
        font: boldFont,
        color: rgb(1, 1, 1)
      });
    });
    
    currentY -= rowHeight;
    
    // Draw components
    let isAlternate = false;
    Object.values(selectedComponents).forEach(component => {
      // Draw row background
      page.drawRectangle({
        x: marginX,
        y: currentY - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: isAlternate ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1)
      });
      
      // Component name
      page.drawText(component.name, {
        x: marginX + 10,
        y: currentY - rowHeight/2 - 6,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      });
      
      // Component description
      page.drawText(component.description || "", {
        x: marginX + colWidths[0] + 10,
        y: currentY - rowHeight/2 - 6,
        size: 10,
        font: font,
        color: rgb(0, 0, 0),
        maxWidth: colWidths[1] - 20
      });
      
      // Component price
      page.drawText(formatCurrency(component.price), {
        x: marginX + colWidths[0] + colWidths[1] + 10,
        y: currentY - rowHeight/2 - 6,
        size: 10,
        font: font,
        color: rgb(0, 0, 0)
      });
      
      currentY -= rowHeight;
      isAlternate = !isAlternate;
    });
    
    // Draw table borders
    page.drawLine({
      start: { x: marginX, y: currentY },
      end: { x: marginX + tableWidth, y: currentY },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    
    currentY -= 40;
    
    // Calculate totals
    const subtotal = Object.values(selectedComponents).reduce(
      (sum, component) => sum + (component.price || 0),
      0
    );
    const profit = (subtotal * margin) / 100;
    const total = subtotal + profit;
    
    // Financial Summary
    page.drawText("Resumo Financeiro", {
      x: marginX,
      y: currentY,
      size: 16,
      font: boldFont,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    currentY -= 30;
    
    // Draw financial summary box
    const summaryWidth = 250;
    page.drawRectangle({
      x: width - marginX - summaryWidth,
      y: currentY - 100,
      width: summaryWidth,
      height: 100,
      borderColor: rgb(0.96, 0.51, 0.13),
      borderWidth: 1,
      color: rgb(0.98, 0.98, 0.98)
    });
    
    // Subtotal
    page.drawText("Subtotal:", {
      x: width - marginX - 240,
      y: currentY - 25,
      size: 12,
      font: font,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(subtotal), {
      x: width - marginX - 80,
      y: currentY - 25,
      size: 12,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    // Margin
    page.drawText(`Margem (${margin}%):`, {
      x: width - marginX - 240,
      y: currentY - 50,
      size: 12,
      font: font,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(profit), {
      x: width - marginX - 80,
      y: currentY - 50,
      size: 12,
      font: boldFont,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    // Separator line
    page.drawLine({
      start: { x: width - marginX - 240, y: currentY - 60 },
      end: { x: width - marginX - 10, y: currentY - 60 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    
    // Total
    page.drawText("Total Mensal:", {
      x: width - marginX - 240,
      y: currentY - 85,
      size: 14,
      font: boldFont,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(total), {
      x: width - marginX - 80,
      y: currentY - 85,
      size: 14,
      font: boldFont,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    // Footer
    page.drawText("HostDime Brasil | www.hostdime.com.br | 0800 200 8532", {
      x: width / 2 - 150,
      y: 30,
      size: 10,
      font: font,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Return the finalized PDF
    return pdfDoc.save();
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    throw new Error("Falha na geração do PDF: " + (error as Error).message);
  }
}
