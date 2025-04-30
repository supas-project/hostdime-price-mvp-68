
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
  const result = checkAndCreateNewPage(pdfDoc, page, currentY, 300, marginX, 50, helvetica);
  page = result.page;
  currentY = result.y;
  currentY -= 30; // Extra spacing for better layout
  
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
  
  // Draw a modernized highlighted box for financial summary
  const boxHeight = 220; // Aumentado para melhor espacamento
  
  // Draw background with subtle gradient effect
  for (let i = 0; i < 4; i++) {
    const gradOpacity = 0.05 - (i * 0.01);
    page.drawRectangle({
      x: marginX - 20 + i,
      y: currentY + 30 - i,
      width: width - (marginX * 2) + 40 - (i * 2),
      height: boxHeight - (i * 2),
      color: COLOR.ACCENT,
      opacity: gradOpacity
    });
  }
  
  // Main box background
  page.drawRectangle({
    x: marginX - 20,
    y: currentY + 30 - boxHeight,
    width: width - (marginX * 2) + 40,
    height: boxHeight,
    color: COLOR.BACKGROUND,
    opacity: 0.9,
    borderWidth: 1,
    borderColor: COLOR.PRIMARY_LIGHT
  });
  
  // Top accent bar
  page.drawRectangle({
    x: marginX - 20,
    y: currentY + 30,
    width: width - (marginX * 2) + 40,
    height: 4,
    color: COLOR.PRIMARY,
    opacity: 0.9
  });
  
  currentY = drawSectionHeader(
    page, 
    "Resumo Financeiro", 
    marginX, 
    currentY, 
    300,
    helveticaBold
  );
  
  // Add some spacing for better layout
  currentY -= 20;
  
  // Draw financial breakdown without showing the margin calculation
  
  // Hardware subtotal with icon (replaced special character with WinAnsi compatible character)
  const hardwareIcon = "+"; // Replacing ■ with +
  page.drawText(hardwareIcon, {
    x: marginX + 20,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  page.drawText("Hardware:", {
    x: marginX + 40,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  const hardwarePrice = formatCurrency(componentsPrice);
  page.drawText(hardwarePrice, {
    x: marginRight - helvetica.widthOfTextAtSize(hardwarePrice, 12) - 20,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  currentY -= 25; // Increased spacing
  
  // Storage subtotal (replaced special character with WinAnsi compatible character)
  const storageIcon = "o"; // Replacing ● with o
  page.drawText(storageIcon, {
    x: marginX + 20,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: COLOR.ACCENT
  });
  
  page.drawText("Armazenamento:", {
    x: marginX + 40,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  const storagePriceFormatted = formatCurrency(storagePrice);
  page.drawText(storagePriceFormatted, {
    x: marginRight - helvetica.widthOfTextAtSize(storagePriceFormatted, 12) - 20,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  currentY -= 25; // Increased spacing
  
  // Services subtotal (replaced special character with WinAnsi compatible character)
  const serviceIcon = "^"; // Replacing ▲ with ^
  page.drawText(serviceIcon, {
    x: marginX + 20,
    y: currentY,
    size: 12,
    font: helveticaBold,
    color: COLOR.PRIMARY_LIGHT
  });
  
  page.drawText("Servicos:", {
    x: marginX + 40,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  const servicesPriceFormatted = formatCurrency(servicesPrice);
  page.drawText(servicesPriceFormatted, {
    x: marginRight - helvetica.widthOfTextAtSize(servicesPriceFormatted, 12) - 20,
    y: currentY,
    size: 12,
    font: helvetica,
    color: COLOR.TEXT
  });
  
  currentY -= 25; // Increased spacing
  
  // Connectivity subtotal (replaced special character with WinAnsi compatible character)
  if (connectivityPrice > 0) {
    const connIcon = "#"; // Replacing ◆ with #
    page.drawText(connIcon, {
      x: marginX + 20,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.TEXT_LIGHT
    });
    
    page.drawText("Conectividade:", {
      x: marginX + 40,
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    const connectivityPriceFormatted = formatCurrency(connectivityPrice);
    page.drawText(connectivityPriceFormatted, {
      x: marginRight - helvetica.widthOfTextAtSize(connectivityPriceFormatted, 12) - 20,
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    currentY -= 25; // Increased spacing
  }
  
  // Draw modernized separator line
  drawSeparator(page, marginX + 20, currentY, width - (marginX * 2) - 40, 0.5);
  
  currentY -= 40; // More space before total
  
  // Modern total section with gradient background
  // Background highlight
  for (let i = 0; i < 3; i++) {
    const highlightOpacity = 0.15 - (i * 0.03);
    page.drawRectangle({
      x: marginX + 20 + i,
      y: currentY - 10 - i,
      width: width - (marginX * 2) - 40 - (i * 2),
      height: 50 - (i * 2),
      color: COLOR.PRIMARY,
      opacity: highlightOpacity,
      borderWidth: i === 0 ? 1 : 0,
      borderColor: i === 0 ? COLOR.PRIMARY_LIGHT : undefined,
      borderOpacity: 0.3
    });
  }
  
  // Total Label
  page.drawText("Total Mensal:", {
    x: marginX + 35,
    y: currentY + 10,
    size: 15,
    font: helveticaBold,
    color: COLOR.SECONDARY
  });
  
  // Total Value with enhanced styling
  const totalPrice = formatCurrency(total);
  page.drawText(totalPrice, {
    x: marginRight - helveticaBold.widthOfTextAtSize(totalPrice, 18) - 30,
    y: currentY + 10,
    size: 18,
    font: helveticaBold,
    color: COLOR.PRIMARY
  });
  
  return { page, y: currentY - 60 };
}
