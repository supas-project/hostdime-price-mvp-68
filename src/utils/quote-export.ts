
import { ComponentOption } from "@/types/component";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
) => {
  try {
    toast.info("Gerando PDF...", {
      description: "Aguarde enquanto preparamos seu documento"
    });
    
    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.276, 841.890]); // A4 size
    
    // Load fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    const margin_x = 50;
    let currentY = height - margin_x;
    
    // Title
    page.drawText("Proposta Comercial - Servidor Dedicado", {
      x: margin_x,
      y: currentY,
      size: 24,
      font: helveticaBold,
      color: rgb(0.96, 0.51, 0.13) // #f58220
    });
    
    currentY -= 30;
    
    // Date
    page.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
      x: margin_x,
      y: currentY,
      size: 12,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    currentY -= 50;
    
    // Components Table Header
    const tableWidth = width - 2 * margin_x;
    const colWidths = [0.4 * tableWidth, 0.4 * tableWidth, 0.2 * tableWidth];
    const rowHeight = 30;
    
    // Draw table header
    page.drawRectangle({
      x: margin_x,
      y: currentY - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    ['Componente', 'Especificação', 'Valor Mensal'].forEach((header, index) => {
      const x = margin_x + (index > 0 ? colWidths.slice(0, index).reduce((a, b) => a + b, 0) : 0) + 10;
      page.drawText(header, {
        x,
        y: currentY - rowHeight/2 - 6,
        size: 12,
        font: helveticaBold,
        color: rgb(1, 1, 1)
      });
    });
    
    currentY -= rowHeight;
    
    // Draw components
    let isAlternate = false;
    Object.values(selectedComponents).forEach(component => {
      // Draw row background
      page.drawRectangle({
        x: margin_x,
        y: currentY - rowHeight,
        width: tableWidth,
        height: rowHeight,
        color: isAlternate ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1)
      });
      
      // Component name
      page.drawText(component.name, {
        x: margin_x + 10,
        y: currentY - rowHeight/2 - 6,
        size: 10,
        font: helvetica,
        color: rgb(0, 0, 0)
      });
      
      // Component description
      page.drawText(component.description || "", {
        x: margin_x + colWidths[0] + 10,
        y: currentY - rowHeight/2 - 6,
        size: 10,
        font: helvetica,
        color: rgb(0, 0, 0),
        maxWidth: colWidths[1] - 20
      });
      
      // Component price
      page.drawText(formatCurrency(component.price), {
        x: margin_x + colWidths[0] + colWidths[1] + 10,
        y: currentY - rowHeight/2 - 6,
        size: 10,
        font: helvetica,
        color: rgb(0, 0, 0)
      });
      
      currentY -= rowHeight;
      isAlternate = !isAlternate;
    });
    
    // Draw table borders
    page.drawLine({
      start: { x: margin_x, y: currentY },
      end: { x: margin_x + tableWidth, y: currentY },
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
      x: margin_x,
      y: currentY,
      size: 16,
      font: helveticaBold,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    currentY -= 30;
    
    // Draw financial summary box
    const summaryWidth = 250;
    page.drawRectangle({
      x: width - margin_x - summaryWidth,
      y: currentY - 100,
      width: summaryWidth,
      height: 100,
      borderColor: rgb(0.96, 0.51, 0.13),
      borderWidth: 1,
      color: rgb(0.98, 0.98, 0.98)
    });
    
    // Subtotal
    page.drawText("Subtotal:", {
      x: width - margin_x - 240,
      y: currentY - 25,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(subtotal), {
      x: width - margin_x - 80,
      y: currentY - 25,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    
    // Margin
    page.drawText(`Margem (${margin}%):`, {
      x: width - margin_x - 240,
      y: currentY - 50,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(profit), {
      x: width - margin_x - 80,
      y: currentY - 50,
      size: 12,
      font: helveticaBold,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    // Separator line
    page.drawLine({
      start: { x: width - margin_x - 240, y: currentY - 60 },
      end: { x: width - margin_x - 10, y: currentY - 60 },
      thickness: 1,
      color: rgb(0.8, 0.8, 0.8)
    });
    
    // Total
    page.drawText("Total Mensal:", {
      x: width - margin_x - 240,
      y: currentY - 85,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(total), {
      x: width - margin_x - 80,
      y: currentY - 85,
      size: 14,
      font: helveticaBold,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    // Footer
    page.drawText("HostDime Brasil | www.hostdime.com.br | 0800 200 8532", {
      x: width / 2 - 150,
      y: 30,
      size: 10,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    // Save and download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `HostDime-Proposta-${new Date().toISOString().split('T')[0]}.pdf`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("PDF gerado com sucesso!", {
      description: "Seu documento foi baixado automaticamente"
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error("Erro ao gerar o PDF", {
      description: "Por favor, tente novamente."
    });
    throw error;
  }
};
