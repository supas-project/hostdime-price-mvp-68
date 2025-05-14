import { PDFDocument, PDFFont } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawHighlightBox } from "../drawing-utils";
import { formatCurrency } from "@/lib/utils";
import { PageContext } from "../types";

export function renderFinancialSection(
  pdfDoc: PDFDocument,
  pageContext: PageContext,
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  width: number,
  marginX: number,
  marginRight: number,
  helvetica: PDFFont,
  helveticaBold: PDFFont,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {}
): PageContext {
  let { page, y: currentY } = pageContext;
  
  // Check if we need to add a new page
  const result = checkAndCreateNewPage(pdfDoc, page, currentY, 200, marginX, 50, helvetica);
  page = result.page;
  currentY = result.y;
  
  // Function to calculate subtotal
  const calculateSubtotal = (): number => {
    let subtotal = 0;
    
    // Add prices of selected components
    for (const key in selectedComponents) {
      if (selectedComponents[key]) {
        subtotal += selectedComponents[key].price;
      }
    }
    
    // Add prices of storage items
    storageItems.internal.forEach(item => subtotal += item.price);
    storageItems.external.forEach(item => subtotal += item.price);
    
    // Add prices of custom services
    customServices.forEach(service => {
      const quantity = service.metadata?.quantity || 1;
      subtotal += service.price * quantity;
    });

    // Add prices of connectivity items
    for (const key in connectivityItems) {
      if (connectivityItems[key]) {
        subtotal += connectivityItems[key].option.price * connectivityItems[key].quantity;
      }
    }
    
    return subtotal;
  };
  
  // Function to calculate total with margin
  const calculateTotalWithMargin = (subtotal: number, margin: number): number => {
    const marginValue = subtotal * (margin / 100);
    return subtotal + marginValue;
  };
  
  // Calculate totals
  const subtotal = calculateSubtotal();
  const totalWithMargin = calculateTotalWithMargin(subtotal, margin);
  
  // Add financial summary section
  currentY -= 20;
  drawHighlightBox(page, marginX - 10, currentY + 10, width - (marginX * 2) + 20, 80);
  
  page.drawText("4. Resumo Financeiro", {
    x: marginX,
    y: currentY,
    size: 14,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  currentY -= 25;
  
  // Display subtotal
  page.drawText(`Subtotal: ${formatCurrency(subtotal)}`, {
    x: marginX,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  currentY -= 20;
  
  // Display total with margin
  page.drawText(`Total (com margem de ${margin}%): ${formatCurrency(totalWithMargin)}`, {
    x: marginX,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: COLOR.TEXT
  });
  
  return { page, y: currentY - 30 };
}
