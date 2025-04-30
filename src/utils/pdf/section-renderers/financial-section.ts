
import { PDFDocument, PDFFont } from "pdf-lib";
import { ComponentOption } from "@/types/component";
import { COLOR } from "../colors";
import { checkAndCreateNewPage, drawHighlightBox, drawSectionHeader, drawSeparator } from "../drawing-utils";
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
  const result = checkAndCreateNewPage(pdfDoc, page, currentY, 250, marginX, 50, helvetica);
  page = result.page;
  currentY = result.y;
  currentY -= 20;
  
  // Calculate totals
  const componentsPrice = Object.values(selectedComponents)
    .filter(comp => comp.type !== "Armazenamento" && comp.type !== "DataCenter" && comp.type !== "Contrato") // Exclude storage, datacenter and contract components
    .reduce((sum, component) => sum + component.price, 0);
  
  const storagePrice = storageItems.internal
    .filter(disk => disk && disk.price > 0)
    .reduce(
      (sum, disk) => sum + disk.price,
      0
    ) + storageItems.external
    .filter(storage => storage && storage.price > 0)
    .reduce(
      (sum, storage) => sum + storage.price,
      0
    );
  
  const servicesPrice = customServices.reduce(
    (sum, service) => sum + service.price,
    0
  );
  
  // Calculate connectivity price
  const connectivityPrice = Object.values(connectivityItems).reduce(
    (sum, item) => sum + (item.option.price * item.quantity),
    0
  );
  
  const subtotal = componentsPrice + storagePrice + servicesPrice + connectivityPrice;
  // Calculate margin but don't show it in the PDF
  const profit = (subtotal * margin) / 100;
  const total = subtotal + profit;
  
  // Draw a highlighted box for financial summary with improved styling
  drawHighlightBox(
    page,
    marginX - 10,
    currentY + 20,
    width - (marginX * 2) + 20,
    180,
    COLOR.BACKGROUND,
    COLOR.PRIMARY
  );
  
  currentY = drawSectionHeader(
    page, 
    "Resumo Financeiro", 
    marginX, 
    currentY, 
    300,
    helveticaBold
  );
  
  // Draw financial breakdown without showing the margin calculation
  
  // Hardware subtotal
  page.drawText("Hardware:", {
    x: marginX + 15,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  const hardwarePrice = formatCurrency(componentsPrice);
  page.drawText(hardwarePrice, {
    x: marginRight - helvetica.widthOfTextAtSize(hardwarePrice, 12) - 15,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  currentY -= 20;
  
  // Storage subtotal
  page.drawText("Armazenamento:", {
    x: marginX + 15,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  const storagePriceFormatted = formatCurrency(storagePrice);
  page.drawText(storagePriceFormatted, {
    x: marginRight - helvetica.widthOfTextAtSize(storagePriceFormatted, 12) - 15,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  currentY -= 20;
  
  // Services subtotal
  page.drawText("Servicos:", {
    x: marginX + 15,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  const servicesPriceFormatted = formatCurrency(servicesPrice);
  page.drawText(servicesPriceFormatted, {
    x: marginRight - helvetica.widthOfTextAtSize(servicesPriceFormatted, 12) - 15,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  currentY -= 20;
  
  // Connectivity subtotal
  if (connectivityPrice > 0) {
    page.drawText("Conectividade:", {
      x: marginX + 15,
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    const connectivityPriceFormatted = formatCurrency(connectivityPrice);
    page.drawText(connectivityPriceFormatted, {
      x: marginRight - helvetica.widthOfTextAtSize(connectivityPriceFormatted, 12) - 15,
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    currentY -= 20;
  }
  
  // Draw separator line
  drawSeparator(page, marginX + 15, currentY, width - (marginX * 2) - 30, 0.5);
  
  currentY -= 30;
  
  // Highly visible total section
  page.drawRectangle({
    x: marginX + 15,
    y: currentY - 5,
    width: width - (marginX * 2) - 30,
    height: 40,
    color: COLOR.PRIMARY_LIGHT,
    opacity: 0.1
  });
  
  // Total - Show only the final price without margin breakdown
  page.drawText("Total Mensal:", {
    x: marginX + 25,
    y: currentY + 10,
    size: 14,
    font: helveticaBold,
    color: COLOR.SECONDARY
  });
  
  const totalPrice = formatCurrency(total);
  page.drawText(totalPrice, {
    x: marginRight - helvetica.widthOfTextAtSize(totalPrice, 16) - 25,
    y: currentY + 10,
    size: 16,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  return { page, y: currentY - 50 };
}
