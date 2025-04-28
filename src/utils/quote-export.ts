
import { ComponentOption } from "@/types/component";
import { PDFDocument, StandardFonts, rgb, PDFImage, PDFPage, PDFFont } from 'pdf-lib';
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface GroupedDisk {
  disk: ComponentOption;
  quantity: number;
}

// Constants for better PDF styling
const COLOR = {
  PRIMARY: rgb(0.96, 0.51, 0.13),      // HostDime Orange (#f58220)
  SECONDARY: rgb(0.10, 0.12, 0.17),    // Dark Blue (#1A1F2C)
  TEXT: rgb(0.2, 0.2, 0.2),            // Dark Gray for text
  TEXT_LIGHT: rgb(0.4, 0.4, 0.4),      // Light Gray for secondary text
  ACCENT: rgb(0.61, 0.53, 0.96),       // Purple accent (#9b87f5)
  WHITE: rgb(1, 1, 1),                 // White
  BACKGROUND: rgb(0.98, 0.98, 0.98),   // Light gray background
  HIGHLIGHT: rgb(1, 0.97, 0.91)        // Cream highlight
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

// Helper function to create section headers with gradient-like effect
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
  height: number
) => {
  page.drawRectangle({
    x,
    y: y - height,
    width,
    height,
    color: COLOR.HIGHLIGHT,
    borderWidth: 1,
    borderColor: COLOR.PRIMARY.clone({ a: 0.3 }),
    opacity: 0.7,
    borderRadius: 4
  });
};

// Helper function to draw a line separator
const drawSeparator = (
  page: PDFPage,
  x: number,
  y: number,
  width: number
) => {
  page.drawLine({
    start: { x, y },
    end: { x: x + width, y },
    thickness: 0.5,
    color: COLOR.SECONDARY.clone({ a: 0.2 }),
    opacity: 0.8
  });
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
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesBold);
    
    // Set up the first page of the PDF
    const page = pdfDoc.addPage([595.276, 841.890]); // A4 dimensions
    const { width, height } = page.getSize();
    
    // Page margins
    const marginX = 50;
    const marginRight = width - marginX;
    let currentY = height - marginX;
    
    // Try to load and embed the HostDime logo
    let logoImage: PDFImage | null = null;
    try {
      // Attempt to fetch HostDime logo
      const logoResponse = await fetch('https://www.hostdime.com.br/blog/wp-content/uploads/2022/01/hostdime-logo-laranja.png');
      const logoArrayBuffer = await logoResponse.arrayBuffer();
      logoImage = await pdfDoc.embedPng(new Uint8Array(logoArrayBuffer));
    } catch (error) {
      console.error("Failed to load logo:", error);
      // Continue without logo
    }
    
    // Draw the logo at the top of the document if available
    if (logoImage) {
      const logoWidth = 140;
      const logoHeight = logoWidth / (logoImage.width / logoImage.height);
      
      page.drawImage(logoImage, {
        x: marginX,
        y: currentY - logoHeight + 15,
        width: logoWidth,
        height: logoHeight
      });
      
      // Add quote title on the right side
      page.drawText("PROPOSTA COMERCIAL", {
        x: marginRight - 220,
        y: currentY - 20,
        size: 20,
        font: timesBold,
        color: COLOR.SECONDARY
      });
      
      // Add date under the title
      const currentDate = new Date().toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      page.drawText(`Data: ${currentDate}`, {
        x: marginRight - 220,
        y: currentY - 45,
        size: 10,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
      
      // Add quote number
      const quoteNumber = `HD-${Math.floor(Math.random() * 90000) + 10000}-${new Date().getFullYear()}`;
      page.drawText(`Cotação: ${quoteNumber}`, {
        x: marginRight - 220,
        y: currentY - 60,
        size: 10,
        font: helveticaBold,
        color: COLOR.TEXT
      });
      
      currentY -= logoHeight + 40;
    } else {
      // Fallback if no logo is available
      page.drawText("HostDime Brasil", {
        x: marginX,
        y: currentY,
        size: 24,
        font: helveticaBold,
        color: COLOR.PRIMARY
      });
      
      currentY -= 40;
    }
    
    // Draw a border around the entire document
    page.drawRectangle({
      x: marginX - 10,
      y: 40,
      width: width - (marginX * 2) + 20,
      height: height - 80,
      borderColor: COLOR.PRIMARY.clone({ a: 0.15 }),
      borderWidth: 1,
      color: COLOR.WHITE
    });
    
    // Executive Summary
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
    
    const summaryText = "Agradecemos seu interesse nos serviços da HostDime Brasil. Apresentamos a seguir uma proposta de servidor dedicado personalizada de acordo com suas necessidades específicas. Nossa equipe está à disposição para quaisquer esclarecimentos adicionais.";
    
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
      "1. Configuração de Hardware", 
      marginX, 
      currentY, 
      300,
      helveticaBold
    );
    
    // Regular Components Section
    Object.values(selectedComponents).forEach(component => {
      // Skip storage components as they will be handled separately
      if (component.type === "Armazenamento") return;
      
      // Component name and price
      page.drawText(component.name, {
        x: marginX,
        y: currentY,
        size: 12,
        font: helveticaBold,
        color: COLOR.TEXT
      });
      
      page.drawText(formatCurrency(component.price), {
        x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(component.price), 12),
        y: currentY,
        size: 12,
        font: helvetica,
        color: COLOR.TEXT
      });
      
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
          page.drawText(`✓ ${feature}`, {
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
      if (currentY < 300) {
        page = pdfDoc.addPage([595.276, 841.890]);
        currentY = height - marginX;
        
        // Add page number at the bottom
        page.drawText(`Página 2`, {
          x: width / 2 - 20,
          y: 30,
          size: 10,
          font: helvetica,
          color: COLOR.TEXT_LIGHT
        });
      }
      
      currentY = drawSectionHeader(
        page, 
        "2. Soluções de Armazenamento", 
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
        
        groupedDisks.forEach(group => {
          // Name and quantity
          page.drawText(`${group.quantity}x ${group.disk.name}`, {
            x: marginX + 15,
            y: currentY,
            size: 12,
            font: helvetica,
            color: COLOR.TEXT
          });
          
          page.drawText(formatCurrency(group.disk.price * group.quantity), {
            x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(group.disk.price * group.quantity), 12),
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
              80
            );
            
            currentY -= 15;
            page.drawText("Configuração RAID:", {
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
              `Proteção: ${group.disk.metadata.raid.protection}`,
              `Capacidade útil: ${group.disk.metadata.raid.usableCapacity}GB`
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
        if (currentY < 200) {
          page = pdfDoc.addPage([595.276, 841.890]);
          currentY = height - marginX;
          
          // Add page number at the bottom
          page.drawText(`Página 3`, {
            x: width / 2 - 20,
            y: 30,
            size: 10,
            font: helvetica,
            color: COLOR.TEXT_LIGHT
          });
        }
        
        page.drawText("2.2 Storage Externo:", {
          x: marginX,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: COLOR.SECONDARY
        });
        
        currentY -= 20;
        
        storageItems.external.forEach(storage => {
          page.drawText(storage.name, {
            x: marginX + 15,
            y: currentY,
            size: 12,
            font: helvetica,
            color: COLOR.TEXT
          });
          
          page.drawText(formatCurrency(storage.price), {
            x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(storage.price), 12),
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
      if (currentY < 200) {
        page = pdfDoc.addPage([595.276, 841.890]);
        currentY = height - marginX;
        
        // Add page number at the bottom
        const pageNumber = pdfDoc.getPageCount();
        page.drawText(`Página ${pageNumber}`, {
          x: width / 2 - 20,
          y: 30,
          size: 10,
          font: helvetica,
          color: COLOR.TEXT_LIGHT
        });
      }
      
      currentY = drawSectionHeader(
        page, 
        "3. Serviços Adicionais", 
        marginX, 
        currentY, 
        300,
        helveticaBold
      );
      
      customServices.forEach(service => {
        const quantity = service.metadata?.quantity || 1;
        const serviceText = quantity > 1 ? `${quantity}x ${service.name}` : service.name;
        
        page.drawText(serviceText, {
          x: marginX,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: COLOR.TEXT
        });
        
        page.drawText(formatCurrency(service.price), {
          x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(service.price), 12),
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
    if (currentY < 250) {
      page = pdfDoc.addPage([595.276, 841.890]);
      currentY = height - marginX;
      
      // Add page number at the bottom
      const pageNumber = pdfDoc.getPageCount();
      page.drawText(`Página ${pageNumber}`, {
        x: width / 2 - 20,
        y: 30,
        size: 10,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
    } else {
      currentY -= 20;
    }
    
    // Draw a highlighted box for financial summary
    drawHighlightBox(
      page,
      marginX - 5,
      currentY + 15,
      width - (marginX * 2) + 10,
      130
    );
    
    currentY = drawSectionHeader(
      page, 
      "Resumo Financeiro", 
      marginX, 
      currentY, 
      300,
      helveticaBold
    );
    
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
    const profit = (subtotal * margin) / 100;
    const total = subtotal + profit;
    
    // Subtotal
    page.drawText("Subtotal de Hardware:", {
      x: marginX + 15,
      y: currentY,
      size: 11,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    page.drawText(formatCurrency(componentsPrice), {
      x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(componentsPrice), 11),
      y: currentY,
      size: 11,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    currentY -= 18;
    
    // Storage subtotal
    page.drawText("Subtotal de Armazenamento:", {
      x: marginX + 15,
      y: currentY,
      size: 11,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    page.drawText(formatCurrency(storagePrice), {
      x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(storagePrice), 11),
      y: currentY,
      size: 11,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    currentY -= 18;
    
    // Services subtotal
    page.drawText("Subtotal de Serviços:", {
      x: marginX + 15,
      y: currentY,
      size: 11,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    page.drawText(formatCurrency(servicesPrice), {
      x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(servicesPrice), 11),
      y: currentY,
      size: 11,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    currentY -= 18;
    
    // Draw separator line
    drawSeparator(page, marginX + 15, currentY, width - (marginX * 2) - 30);
    
    currentY -= 18;
    
    // Subtotal
    page.drawText("Subtotal:", {
      x: marginX + 15,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.TEXT
    });
    
    page.drawText(formatCurrency(subtotal), {
      x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(subtotal), 12),
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.TEXT
    });
    
    currentY -= 18;
    
    // Margin
    page.drawText(`Margem (${margin}%):`, {
      x: marginX + 15,
      y: currentY,
      size: 12,
      font: helvetica,
      color: COLOR.TEXT
    });
    
    page.drawText(formatCurrency(profit), {
      x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(profit), 12),
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: COLOR.PRIMARY
    });
    
    currentY -= 25;
    
    // Total
    page.drawText("Total Mensal:", {
      x: marginX + 15,
      y: currentY,
      size: 14,
      font: helveticaBold,
      color: COLOR.SECONDARY
    });
    
    page.drawText(formatCurrency(total), {
      x: marginRight - helvetica.widthOfTextAtSize(formatCurrency(total), 14),
      y: currentY,
      size: 14,
      font: helveticaBold,
      color: COLOR.PRIMARY
    });
    
    currentY -= 40;
    
    // Commercial section - Benefits
    if (currentY < 200) {
      page = pdfDoc.addPage([595.276, 841.890]);
      currentY = height - marginX;
      
      // Add page number
      const pageNumber = pdfDoc.getPageCount();
      page.drawText(`Página ${pageNumber}`, {
        x: width / 2 - 20,
        y: 30,
        size: 10,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
    }
    
    currentY = drawSectionHeader(
      page, 
      "Por que escolher a HostDime?", 
      marginX, 
      currentY, 
      300,
      helveticaBold
    );
    
    const benefits = [
      "Suporte Técnico 24x7x365 por telefone, chat e ticket",
      "Data Centers com certificação Tier III e Tier IV",
      "Infraestrutura de rede redundante com múltiplos carriers",
      "Monitoramento proativo em tempo real",
      "SLA de 99.999% de uptime",
      "Mais de 20 anos de experiência em hospedagem"
    ];
    
    benefits.forEach(benefit => {
      page.drawText(`✓ ${benefit}`, {
        x: marginX + 15,
        y: currentY,
        size: 11,
        font: helvetica,
        color: COLOR.TEXT
      });
      currentY -= 18;
    });
    
    currentY -= 20;
    
    // Terms and Conditions
    currentY = drawSectionHeader(
      page, 
      "Termos e Condições", 
      marginX, 
      currentY, 
      300,
      helveticaBold
    );
    
    const terms = [
      "• Valores em reais (BRL), cobrados mensalmente.",
      "• Esta proposta é válida por 15 dias a partir da data de emissão.",
      "• Prazo de ativação: até 48 horas após confirmação do pagamento.",
      "• O pagamento pode ser realizado via boleto bancário, cartão de crédito ou transferência.",
      "• Impostos podem ser aplicáveis dependendo da região e modalidade de contratação."
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
        color: COLOR.TEXT_LIGHT.clone({ a: 0.6 })
      });
      
      // Add page number
      footerPage.drawText(`Página ${i + 1} de ${pdfDoc.getPageCount()}`, {
        x: marginRight - 80,
        y: footerY,
        size: 8,
        font: helvetica,
        color: COLOR.TEXT_LIGHT
      });
    }
    
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
