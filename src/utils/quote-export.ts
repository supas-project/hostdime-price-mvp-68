
import { ComponentOption } from "@/types/component";
import { PDFDocument, StandardFonts, rgb, PDFImage, PDFPage, PDFFont, RGB } from 'pdf-lib';
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface GroupedDisk {
  disk: ComponentOption;
  quantity: number;
}

// Enhanced color scheme for a more professional look
const COLOR = {
  PRIMARY: rgb(0.96, 0.51, 0.13),      // HostDime Orange (#f58220)
  SECONDARY: rgb(0.10, 0.12, 0.17),    // Dark Blue (#1A1F2C)
  PRIMARY_LIGHT: rgb(0.98, 0.67, 0.40), // Light Orange
  TEXT: rgb(0.2, 0.2, 0.2),            // Dark Gray for text
  TEXT_LIGHT: rgb(0.4, 0.4, 0.4),      // Light Gray for secondary text
  ACCENT: rgb(0.61, 0.53, 0.96),       // Purple accent (#9b87f5)
  WHITE: rgb(1, 1, 1),                 // White
  BACKGROUND: rgb(0.98, 0.98, 0.98),   // Light gray background
  HIGHLIGHT: rgb(1, 0.97, 0.91),       // Cream highlight
  TABLE_ROW_ALT: rgb(0.97, 0.97, 0.97) // Alternating row color
};

// Helper function to group disks by type and capacity for cleaner display
const groupDisksByTypeAndCapacity = (disks: ComponentOption[]): GroupedDisk[] => {
  const diskGroups: { [key: string]: GroupedDisk } = {};
  
  disks.forEach(disk => {
    const key = `${disk.name}-${disk.description}`;
    
    if (diskGroups[key]) {
      diskGroups[key].quantity += 1;
    } else {
      diskGroups[key] = {
        disk: { ...disk },
        quantity: 1
      };
    }
  });
  
  return Object.values(diskGroups);
};

// Improved header drawing function with gradient background
const drawHeader = async (
  pdfDoc: PDFDocument,
  page: PDFPage,
  width: number,
  currentY: number,
  helveticaBold: PDFFont
): Promise<number> => {
  // Draw header background
  page.drawRectangle({
    x: 0,
    y: currentY - 60,
    width: width,
    height: 60,
    color: COLOR.SECONDARY
  });
  
  // Draw orange accent line
  page.drawRectangle({
    x: 0,
    y: currentY - 60,
    width: width,
    height: 8,
    color: COLOR.PRIMARY
  });
  
  // Try to load and embed the HostDime logo
  let logoImage: PDFImage | null = null;
  try {
    // Attempt to fetch HostDime logo
    const logoResponse = await fetch('https://www.hostdime.com.br/blog/wp-content/uploads/2022/01/hostdime-logo-laranja.png');
    const logoArrayBuffer = await logoResponse.arrayBuffer();
    logoImage = await pdfDoc.embedPng(new Uint8Array(logoArrayBuffer));
    
    // Draw logo on white background for better visibility
    page.drawRectangle({
      x: 50,
      y: currentY - 50,
      width: 140,
      height: 40,
      color: COLOR.WHITE,
      borderWidth: 0,
      borderRadius: 4
    });
    
    const logoWidth = 130;
    const logoHeight = logoWidth / (logoImage.width / logoImage.height);
    
    page.drawImage(logoImage, {
      x: 55,
      y: currentY - 45,
      width: logoWidth,
      height: logoHeight - 5
    });
  } catch (error) {
    console.error("Failed to load logo:", error);
    // Fallback text if logo can't be loaded
    page.drawText("HostDime Brasil", {
      x: 50,
      y: currentY - 30,
      size: 24,
      font: helveticaBold,
      color: COLOR.WHITE
    });
  }
  
  return currentY - 70;
};

// Enhanced section header with accent styling
const drawSectionHeader = (
  page: PDFPage, 
  text: string,
  x: number,
  y: number,
  width: number,
  boldFont: PDFFont,
  size: number = 16
) => {
  // Draw a rectangle with the primary color
  page.drawRectangle({
    x: x - 10,
    y: y - 5,
    width: width + 20,
    height: size + 10,
    color: COLOR.PRIMARY,
    borderWidth: 0,
    opacity: 0.1,
    borderRadius: 4
  });
  
  // Draw accent line
  page.drawRectangle({
    x: x - 10,
    y: y - 5,
    width: 5,
    height: size + 10,
    color: COLOR.PRIMARY,
    borderWidth: 0,
  });
  
  // Draw the actual text
  page.drawText(text, {
    x: x,
    y: y,
    size: size,
    font: boldFont,
    color: COLOR.PRIMARY
  });
  
  return y - (size + 15); // Return new Y position after the header
};

// Helper function to create a highlighted box for important information
const drawHighlightBox = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  color: RGB = COLOR.HIGHLIGHT,
  borderColor: RGB = COLOR.PRIMARY_LIGHT
) => {
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color: color,
    borderWidth: 1,
    borderColor: borderColor,
    opacity: 0.7,
    borderRadius: 5
  });
};

// Enhanced separator with gradient effect
const drawSeparator = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  opacity: number = 0.2
) => {
  // Draw main separator line
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 0.7,
    color: COLOR.SECONDARY,
    opacity: opacity
  });
  
  // Draw accent line at start
  page.drawLine({
    start: { x, y },
    end: { x: x + 30, y },
    thickness: 1.5,
    color: COLOR.PRIMARY,
    opacity: opacity + 0.3
  });
};

// Helper function to draw table rows with alternating colors
const drawTableRow = (
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  isAlternate: boolean = false
) => {
  if (isAlternate) {
    page.drawRectangle({
      x,
      y: y - height,
      width,
      height,
      color: COLOR.TABLE_ROW_ALT,
      borderWidth: 0
    });
  }
};

// Helper function to check if we need a new page
const checkAndCreateNewPage = (
  pdfDoc: PDFDocument,
  currentPage: PDFPage,
  currentY: number,
  requiredSpace: number,
  marginX: number,
  marginY: number
): { page: PDFPage, y: number } => {
  if (currentY < requiredSpace) {
    // Create new page
    const newPage = pdfDoc.addPage([595.276, 841.890]);
    const { width, height } = newPage.getSize();
    
    // Add page number at the bottom
    const pageNumber = pdfDoc.getPageCount();
    newPage.drawText(`Pagina ${pageNumber}`, {
      x: width / 2 - 20,
      y: 30,
      size: 10,
      font: currentPage.getFont(),
      color: COLOR.TEXT_LIGHT
    });
    
    return { page: newPage, y: height - marginY };
  }
  
  return { page: currentPage, y: currentY };
};

export const generateQuotePDF = async (
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number
) => {
  try {
    toast.info("Gerando PDF...", {
      description: "Aguarde enquanto preparamos seu documento"
    });
    
    const pdfDoc = await PDFDocument.create();
    
    // Load the standardized fonts
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Set up the first page of the PDF
    let page = pdfDoc.addPage([595.276, 841.890]); // A4 dimensions
    const { width, height } = page.getSize();
    
    // Page margins
    const marginX = 50;
    const marginRight = width - marginX;
    let currentY = height - 50;
    
    // Draw enhanced header
    currentY = await drawHeader(pdfDoc, page, width, currentY, helveticaBold);
    
    // Add quote title and date in an elegant format
    const quoteBox = {
      x: marginRight - 250,
      y: currentY + 20,
      width: 230,
      height: 80
    };
    
    // Draw quote info box
    drawHighlightBox(
      page,
      quoteBox.x,
      quoteBox.y,
      quoteBox.width,
      quoteBox.height,
      COLOR.BACKGROUND
    );
    
    // Add title
    page.drawText("PROPOSTA COMERCIAL", {
      x: quoteBox.x + 10,
      y: quoteBox.y - 25,
      size: 16,
      font: helveticaBold,
      color: COLOR.SECONDARY
    });
    
    // Add date under the title
    const currentDate = new Date().toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    page.drawText(`Data: ${currentDate}`, {
      x: quoteBox.x + 10,
      y: quoteBox.y - 45,
      size: 10,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    // Add quote number
    const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
    page.drawText(`Cotacao: ${quoteNumber}`, {
      x: quoteBox.x + 10,
      y: quoteBox.y - 60,
      size: 10,
      font: helveticaBold,
      color: COLOR.PRIMARY
    });
    
    // Draw a border around the entire document
    page.drawRectangle({
      x: marginX - 10,
      y: 40,
      width: width - (marginX * 2) + 20,
      height: height - 80,
      borderColor: COLOR.PRIMARY,
      borderWidth: 0.7,
      opacity: 0.15,
      color: COLOR.WHITE,
      borderRadius: 3
    });
    
    // Executive Summary
    currentY -= 20;
    drawSeparator(page, marginX, currentY, width - (marginX * 2));
    currentY -= 25;
    
    page.drawText("Resumo Executivo", {
      x: marginX,
      y: currentY,
      size: 14,
      font: helveticaBold,
      color: COLOR.SECONDARY
    });
    
    currentY -= 25;
    
    const summaryText = "Agradecemos seu interesse nos servicos da HostDime Brasil. Apresentamos a seguir uma proposta de servidor dedicado personalizada de acordo com suas necessidades especificas. Nossa equipe esta a disposicao para quaisquer esclarecimentos adicionais.";
    
    // Break summary into lines
    const maxWidth = width - (marginX * 2);
    const words = summaryText.split(' ');
    let line = '';
    let lineCount = 0;
    
    for (const word of words) {
      const testLine = line + word + ' ';
      const testWidth = helvetica.widthOfTextAtSize(testLine, 10);
      
      if (testWidth > maxWidth) {
        // Draw the current line and start a new one
        page.drawText(line, {
          x: marginX,
          y: currentY - (lineCount * 15),
          size: 10,
          font: helvetica,
          color: COLOR.TEXT
        });
        
        line = word + ' ';
        lineCount++;
      } else {
        line = testLine;
      }
    }
    
    // Draw remaining text
    if (line) {
      page.drawText(line, {
        x: marginX,
        y: currentY - (lineCount * 15),
        size: 10,
        font: helvetica,
        color: COLOR.TEXT
      });
      lineCount++;
    }
    
    currentY -= (lineCount * 15) + 25;
    
    // Hardware Configuration Section
    currentY = drawSectionHeader(
      page, 
      "1. Configuracao de Hardware", 
      marginX, 
      currentY, 
      300,
      helveticaBold
    );
    
    // Regular Components Section
    let rowAlt = false;
    Object.values(selectedComponents).forEach(component => {
      // Skip storage components as they will be handled separately
      if (component.type === "Armazenamento") return;
      
      // Check if we need a new page
      const result = checkAndCreateNewPage(pdfDoc, page, currentY, 150, marginX, 50);
      page = result.page;
      currentY = result.y;
      
      // Draw alternating row background
      drawTableRow(page, marginX - 5, currentY + 5, width - (marginX * 2) + 10, 20 + 
        (component.description ? 18 : 0) + 
        (component.specs ? component.specs.length * 14 + 5 : 0) + 
        (component.metadata?.features ? component.metadata.features.length * 14 + 5 : 0),
        rowAlt
      );
      rowAlt = !rowAlt;
      
      // Component name and price
      page.drawText(component.name, {
        x: marginX,
        y: currentY,
        size: 12,
        font: helveticaBold,
        color: COLOR.TEXT
      });
      
      if (component.type !== "DataCenter" && component.type !== "Contrato") {
        const price = formatCurrency(component.price);
        page.drawText(price, {
          x: marginRight - helvetica.widthOfTextAtSize(price, 12),
          y: currentY,
          size: 12,
          font: helvetica,
          color: COLOR.TEXT
        });
      } else {
        page.drawText("Incluído", {
          x: marginRight - helvetica.widthOfTextAtSize("Incluído", 12),
          y: currentY,
          size: 12,
          font: helvetica,
          color: COLOR.TEXT_LIGHT
        });
      }
      
      currentY -= 18;
      
      // Description
      if (component.description) {
        page.drawText(component.description, {
          x: marginX + 15,
          y: currentY,
          size: 10,
          font: helveticaOblique,
          color: COLOR.TEXT_LIGHT
        });
        currentY -= 15;
      }
      
      // Specifications
      if (component.specs) {
        component.specs.forEach(spec => {
          page.drawText(`• ${spec}`, {
            x: marginX + 20,
            y: currentY,
            size: 10,
            font: helvetica,
            color: COLOR.TEXT_LIGHT
          });
          currentY -= 14;
        });
      }
      
      // If component has features, highlight them
      if (component.metadata?.features && component.metadata.features.length > 0) {
        currentY -= 5;
        component.metadata.features.forEach(feature => {
          page.drawText(`> ${feature}`, {
            x: marginX + 20,
            y: currentY,
            size: 10,
            font: helveticaBold,
            color: COLOR.PRIMARY
          });
          currentY -= 14;
        });
      }
      
      currentY -= 10;
    });
    
    // Storage Section
    if (storageItems.internal.length > 0 || storageItems.external.length > 0) {
      // Check if we need to add a new page based on remaining space
      const storagePageCheck = checkAndCreateNewPage(pdfDoc, page, currentY, 300, marginX, 50);
      page = storagePageCheck.page;
      currentY = storagePageCheck.y;
      
      currentY = drawSectionHeader(
        page, 
        "2. Solucoes de Armazenamento", 
        marginX, 
        currentY, 
        300,
        helveticaBold
      );
      
      // Internal Storage
      if (storageItems.internal.length > 0) {
        page.drawText("2.1 Discos Internos:", {
          x: marginX,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: COLOR.SECONDARY
        });
        
        currentY -= 20;
        
        const groupedDisks = groupDisksByTypeAndCapacity(storageItems.internal);
        
        rowAlt = false;
        groupedDisks.forEach(group => {
          // Check if we need a new page
          const result = checkAndCreateNewPage(pdfDoc, page, currentY, 150, marginX, 50);
          page = result.page;
          currentY = result.y;
          
          // Draw alternating row background
          const rowHeight = 20 + 
            (group.disk.description ? 15 : 0) + 
            (group.disk.specs ? group.disk.specs.length * 14 : 0) +
            (group.disk.metadata?.raid && group.disk.metadata.raid.type !== 'none' ? 80 : 0);
          
          drawTableRow(page, marginX + 10, currentY + 5, width - (marginX * 2) - 20, rowHeight, rowAlt);
          rowAlt = !rowAlt;
          
          // Name and quantity
          page.drawText(`${group.quantity}x ${group.disk.name}`, {
            x: marginX + 15,
            y: currentY,
            size: 12,
            font: helvetica,
            color: COLOR.TEXT
          });
          
          const price = formatCurrency(group.disk.price * group.quantity);
          page.drawText(price, {
            x: marginRight - helvetica.widthOfTextAtSize(price, 12),
            y: currentY,
            size: 12,
            font: helvetica,
            color: COLOR.TEXT
          });
          
          currentY -= 20;
          
          // Description and specs
          if (group.disk.description) {
            page.drawText(group.disk.description, {
              x: marginX + 30,
              y: currentY,
              size: 10,
              font: helveticaOblique,
              color: COLOR.TEXT_LIGHT
            });
            currentY -= 15;
          }
          
          if (group.disk.specs) {
            group.disk.specs.forEach(spec => {
              page.drawText(`• ${spec}`, {
                x: marginX + 30,
                y: currentY,
                size: 10,
                font: helvetica,
                color: COLOR.TEXT_LIGHT
              });
              currentY -= 14;
            });
          }
          
          // RAID Configuration
          if (group.disk.metadata?.raid && group.disk.metadata.raid.type !== 'none') {
            // Add a highlighted background for RAID configuration
            drawHighlightBox(
              page,
              marginX + 25,
              currentY - 5,
              300,
              80,
              rgb(0.95, 0.95, 1.0), // Light blue background
              rgb(0.7, 0.7, 0.9)     // Blue border
            );
            
            currentY -= 15;
            page.drawText("Configuracao RAID:", {
              x: marginX + 30,
              y: currentY,
              size: 11,
              font: helveticaBold,
              color: COLOR.SECONDARY
            });
            currentY -= 18;
            
            const raidInfo = [
              `Tipo: RAID ${group.disk.metadata.raid.type}`,
              group.disk.metadata.raid.description,
              `Protecao: ${group.disk.metadata.raid.protection}`,
              `Capacidade util: ${group.disk.metadata.raid.usableCapacity}GB`
            ];
            
            raidInfo.forEach(info => {
              page.drawText(`• ${info}`, {
                x: marginX + 35,
                y: currentY,
                size: 10,
                font: helvetica,
                color: COLOR.TEXT
              });
              currentY -= 14;
            });
            
            currentY -= 5;
          }
          
          currentY -= 10;
        });
      }
      
      // External Storage
      if (storageItems.external.length > 0) {
        // Check if we need a new page
        const result = checkAndCreateNewPage(pdfDoc, page, currentY, 200, marginX, 50);
        page = result.page;
        currentY = result.y;
        
        page.drawText("2.2 Storage Externo:", {
          x: marginX,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: COLOR.SECONDARY
        });
        
        currentY -= 20;
        
        rowAlt = false;
        storageItems.external.forEach(storage => {
          // Draw alternating row background
          const rowHeight = 20 + 
            (storage.description ? 15 : 0) + 
            (storage.specs ? storage.specs.length * 14 : 0);
          
          drawTableRow(page, marginX + 10, currentY + 5, width - (marginX * 2) - 20, rowHeight, rowAlt);
          rowAlt = !rowAlt;
          
          page.drawText(storage.name, {
            x: marginX + 15,
            y: currentY,
            size: 12,
            font: helvetica,
            color: COLOR.TEXT
          });
          
          const price = formatCurrency(storage.price);
          page.drawText(price, {
            x: marginRight - helvetica.widthOfTextAtSize(price, 12),
            y: currentY,
            size: 12,
            font: helvetica,
            color: COLOR.TEXT
          });
          
          currentY -= 20;
          
          if (storage.description) {
            page.drawText(storage.description, {
              x: marginX + 30,
              y: currentY,
              size: 10,
              font: helveticaOblique,
              color: COLOR.TEXT_LIGHT
            });
            currentY -= 15;
          }
          
          if (storage.specs) {
            storage.specs.forEach(spec => {
              page.drawText(`• ${spec}`, {
                x: marginX + 30,
                y: currentY,
                size: 10,
                font: helvetica,
                color: COLOR.TEXT_LIGHT
              });
              currentY -= 14;
            });
          }
          
          currentY -= 10;
        });
      }
    }
    
    // Custom Services Section
    if (customServices.length > 0) {
      // Check if we need to add a new page
      const result = checkAndCreateNewPage(pdfDoc, page, currentY, 200, marginX, 50);
      page = result.page;
      currentY = result.y;
      
      currentY = drawSectionHeader(
        page, 
        "3. Servicos Adicionais", 
        marginX, 
        currentY, 
        300,
        helveticaBold
      );
      
      rowAlt = false;
      customServices.forEach(service => {
        // Draw alternating row background
        const rowHeight = 20 + 
          (service.description ? 15 : 0) + 
          (service.specs ? service.specs.length * 14 : 0);
        
        drawTableRow(page, marginX - 5, currentY + 5, width - (marginX * 2) + 10, rowHeight, rowAlt);
        rowAlt = !rowAlt;
        
        const quantity = service.metadata?.quantity || 1;
        const serviceText = quantity > 1 ? `${quantity}x ${service.name}` : service.name;
        
        page.drawText(serviceText, {
          x: marginX,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: COLOR.TEXT
        });
        
        const price = formatCurrency(service.price);
        page.drawText(price, {
          x: marginRight - helvetica.widthOfTextAtSize(price, 12),
          y: currentY,
          size: 12,
          font: helvetica,
          color: COLOR.TEXT
        });
        
        currentY -= 20;
        
        if (service.description) {
          page.drawText(service.description, {
            x: marginX + 15,
            y: currentY,
            size: 10,
            font: helveticaOblique,
            color: COLOR.TEXT_LIGHT
          });
          currentY -= 15;
        }
        
        if (service.specs) {
          service.specs.forEach(spec => {
            page.drawText(`• ${spec}`, {
              x: marginX + 20,
              y: currentY,
              size: 10,
              font: helvetica,
              color: COLOR.TEXT_LIGHT
            });
            currentY -= 14;
          });
        }
        
        currentY -= 10;
      });
    }
    
    // Financial Summary
    // Check if we need to add a new page
    const result = checkAndCreateNewPage(pdfDoc, page, currentY, 250, marginX, 50);
    page = result.page;
    currentY = result.y;
    currentY -= 20;
    
    // Calculate totals
    const componentsPrice = Object.values(selectedComponents)
      .filter(comp => comp.type !== "Armazenamento") // Exclude storage components
      .reduce((sum, component) => sum + component.price, 0);
    
    const storagePrice = storageItems.internal.reduce(
      (sum, disk) => sum + disk.price,
      0
    ) + storageItems.external.reduce(
      (sum, storage) => sum + storage.price,
      0
    );
    
    const servicesPrice = customServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    
    const subtotal = componentsPrice + storagePrice + servicesPrice;
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
      rgb(0.97, 0.97, 0.99),  // Very light background
      COLOR.PRIMARY           // Orange border
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
      x: marginRight - helvetica.widthOfTextAtSize(hardwarePrice, 12),
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
      x: marginRight - helvetica.widthOfTextAtSize(storagePriceFormatted, 12),
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
      x: marginRight - helvetica.widthOfTextAtSize(servicesPriceFormatted, 12),
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    currentY -= 25;
    
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
      opacity: 0.1,
      borderRadius: 5
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
      x: marginRight - helvetica.widthOfTextAtSize(totalPrice, 16) - 15,
      y: currentY + 10,
      size: 16,
      font: helveticaBold,
      color: COLOR.PRIMARY
    });
    
    currentY -= 50;
    
    // Commercial section - Benefits
    const benefitsCheck = checkAndCreateNewPage(pdfDoc, page, currentY, 200, marginX, 50);
    page = benefitsCheck.page;
    currentY = benefitsCheck.y;
    
    currentY = drawSectionHeader(
      page, 
      "Por que escolher a HostDime?", 
      marginX, 
      currentY, 
      300,
      helveticaBold
    );
    
    // Enhanced benefits display with icons (using text markers for now)
    const benefits = [
      "Suporte Tecnico 24x7x365 por telefone, chat e ticket",
      "Data Centers com certificacao Tier III e Tier IV",
      "Infraestrutura de rede redundante com multiplos carriers",
      "Monitoramento proativo em tempo real",
      "SLA de 99.999% de uptime",
      "Mais de 20 anos de experiencia em hospedagem"
    ];
    
    // Draw benefits in a two-column layout
    const columnWidth = (width - (marginX * 2) - 40) / 2;
    let leftColumnY = currentY;
    let rightColumnY = currentY;
    
    for (let i = 0; i < benefits.length; i++) {
      const benefit = benefits[i];
      const isLeftColumn = i % 2 === 0;
      const x = isLeftColumn ? marginX + 5 : marginX + columnWidth + 30;
      const y = isLeftColumn ? leftColumnY : rightColumnY;
      
      // Draw highlight box
      page.drawRectangle({
        x: x - 5,
        y: y - 5,
        width: columnWidth,
        height: 25,
        color: COLOR.PRIMARY,
        opacity: 0.05,
        borderRadius: 3
      });
      
      // Draw check mark
      page.drawText("✓", {
        x: x,
        y,
        size: 12,
        font: helveticaBold,
        color: COLOR.PRIMARY
      });
      
      // Draw benefit text
      page.drawText(benefit, {
        x: x + 15,
        y,
        size: 10,
        font: helvetica,
        color: COLOR.TEXT
      });
      
      // Update column position
      if (isLeftColumn) {
        leftColumnY -= 30;
      } else {
        rightColumnY -= 30;
      }
    }
    
    // Use the lowest Y position
    currentY = Math.min(leftColumnY, rightColumnY) - 20;
    
    // Terms and Conditions
    currentY = drawSectionHeader(
      page, 
      "Termos e Condicoes", 
      marginX, 
      currentY, 
      300,
      helveticaBold
    );
    
    const terms = [
      "• Valores em reais (BRL), cobrados mensalmente.",
      "• Esta proposta e valida por 15 dias a partir da data de emissao.",
      "• Prazo de ativacao: ate 48 horas apos confirmacao do pagamento.",
      "• O pagamento pode ser realizado via boleto bancario, cartao de credito ou transferencia.",
      "• Impostos podem ser aplicaveis dependendo da regiao e modalidade de contratacao."
    ];
    
    terms.forEach(term => {
      page.drawText(term, {
        x: marginX,
        y: currentY,
        size: 10,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
      currentY -= 16;
    });
    
    // Footer on all pages
    for (let i = 0; i < pdfDoc.getPageCount(); i++) {
      const footerPage = pdfDoc.getPage(i);
      const footerY = 15;
      
      drawSeparator(footerPage, marginX, 50, width - (marginX * 2));
      
      // Footer with company information
      footerPage.drawText("HostDime Brasil | www.hostdime.com.br | 0800 200 8532 | comercial@hostdime.com.br", {
        x: width / 2 - 190, // Centered
        y: footerY,
        size: 9,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
      
      // Add small watermark-style text
      footerPage.drawText("Proposta gerada em " + new Date().toLocaleDateString('pt-BR'), {
        x: marginX,
        y: footerY,
        size: 8,
        font: helveticaOblique,
        color: COLOR.TEXT_LIGHT,
        opacity: 0.6
      });
      
      // Add page number
      footerPage.drawText(`Pagina ${i + 1} de ${pdfDoc.getPageCount()}`, {
        x: marginRight - 80,
        y: footerY,
        size: 8,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
    }
    
    // Improved error handling for PDF generation
    try {
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
    } catch (pdfError) {
      console.error('Erro ao finalizar o PDF:', pdfError);
      toast.error("Erro ao finalizar o PDF", {
        description: "Tente novamente ou entre em contato com o suporte."
      });
    }
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    toast.error("Erro ao gerar o PDF", {
      description: "Por favor, tente novamente."
    });
    throw error;
  }
};
