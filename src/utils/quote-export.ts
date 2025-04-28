
import { ComponentOption } from "@/types/component";
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface GroupedDisk {
  disk: ComponentOption;
  quantity: number;
}

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
    const page = pdfDoc.addPage([595.276, 841.890]); // A4
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    const { width, height } = page.getSize();
    const margin_x = 50;
    let currentY = height - margin_x;
    
    // Title and Date
    page.drawText("Proposta Comercial - Servidor Dedicado", {
      x: margin_x,
      y: currentY,
      size: 24,
      font: helveticaBold,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    currentY -= 30;
    
    page.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
      x: margin_x,
      y: currentY,
      size: 12,
      font: helvetica,
      color: rgb(0.5, 0.5, 0.5)
    });
    
    currentY -= 50;
    
    // Regular Components Section
    page.drawText("Componentes Básicos", {
      x: margin_x,
      y: currentY,
      size: 16,
      font: helveticaBold,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    currentY -= 30;
    
    Object.values(selectedComponents).forEach(component => {
      // Component name and price
      page.drawText(component.name, {
        x: margin_x,
        y: currentY,
        size: 12,
        font: helveticaBold,
        color: rgb(0, 0, 0)
      });
      
      page.drawText(formatCurrency(component.price), {
        x: width - margin_x - 100,
        y: currentY,
        size: 12,
        font: helvetica,
        color: rgb(0, 0, 0)
      });
      
      currentY -= 20;
      
      // Description
      if (component.description) {
        page.drawText(component.description, {
          x: margin_x + 20,
          y: currentY,
          size: 10,
          font: helvetica,
          color: rgb(0.4, 0.4, 0.4)
        });
        currentY -= 15;
      }
      
      // Specifications
      if (component.specs) {
        component.specs.forEach(spec => {
          page.drawText(`• ${spec}`, {
            x: margin_x + 20,
            y: currentY,
            size: 10,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4)
          });
          currentY -= 15;
        });
      }
      
      currentY -= 10;
    });
    
    // Storage Section
    if (storageItems.internal.length > 0 || storageItems.external.length > 0) {
      currentY -= 20;
      
      page.drawText("Armazenamento", {
        x: margin_x,
        y: currentY,
        size: 16,
        font: helveticaBold,
        color: rgb(0.96, 0.51, 0.13)
      });
      
      currentY -= 30;
      
      // Internal Storage
      if (storageItems.internal.length > 0) {
        page.drawText("Discos Internos:", {
          x: margin_x,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: rgb(0, 0, 0)
        });
        
        currentY -= 20;
        
        const groupedDisks = groupDisksByTypeAndCapacity(storageItems.internal);
        
        groupedDisks.forEach(group => {
          // Name and quantity
          page.drawText(`${group.quantity}x ${group.disk.name}`, {
            x: margin_x + 20,
            y: currentY,
            size: 12,
            font: helvetica,
            color: rgb(0, 0, 0)
          });
          
          page.drawText(formatCurrency(group.disk.price * group.quantity), {
            x: width - margin_x - 100,
            y: currentY,
            size: 12,
            font: helvetica,
            color: rgb(0, 0, 0)
          });
          
          currentY -= 20;
          
          // Description and specs
          if (group.disk.description) {
            page.drawText(group.disk.description, {
              x: margin_x + 40,
              y: currentY,
              size: 10,
              font: helvetica,
              color: rgb(0.4, 0.4, 0.4)
            });
            currentY -= 15;
          }
          
          if (group.disk.specs) {
            group.disk.specs.forEach(spec => {
              page.drawText(`• ${spec}`, {
                x: margin_x + 40,
                y: currentY,
                size: 10,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.4)
              });
              currentY -= 15;
            });
          }
          
          // RAID Configuration
          if (group.disk.metadata?.raid && group.disk.metadata.raid.type !== 'none') {
            currentY -= 10;
            page.drawText("Configuração RAID:", {
              x: margin_x + 40,
              y: currentY,
              size: 10,
              font: helveticaBold,
              color: rgb(0, 0, 0)
            });
            currentY -= 15;
            
            const raidInfo = [
              `Tipo: RAID ${group.disk.metadata.raid.type}`,
              group.disk.metadata.raid.description,
              `Proteção: ${group.disk.metadata.raid.protection}`,
              `Capacidade útil: ${group.disk.metadata.raid.usableCapacity}GB`
            ];
            
            raidInfo.forEach(info => {
              page.drawText(`• ${info}`, {
                x: margin_x + 40,
                y: currentY,
                size: 10,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.4)
              });
              currentY -= 15;
            });
          }
          
          currentY -= 10;
        });
      }
      
      // External Storage
      if (storageItems.external.length > 0) {
        currentY -= 10;
        
        page.drawText("Storage Externo:", {
          x: margin_x,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: rgb(0, 0, 0)
        });
        
        currentY -= 20;
        
        storageItems.external.forEach(storage => {
          page.drawText(storage.name, {
            x: margin_x + 20,
            y: currentY,
            size: 12,
            font: helvetica,
            color: rgb(0, 0, 0)
          });
          
          page.drawText(formatCurrency(storage.price), {
            x: width - margin_x - 100,
            y: currentY,
            size: 12,
            font: helvetica,
            color: rgb(0, 0, 0)
          });
          
          currentY -= 20;
          
          if (storage.description) {
            page.drawText(storage.description, {
              x: margin_x + 40,
              y: currentY,
              size: 10,
              font: helvetica,
              color: rgb(0.4, 0.4, 0.4)
            });
            currentY -= 15;
          }
          
          if (storage.specs) {
            storage.specs.forEach(spec => {
              page.drawText(`• ${spec}`, {
                x: margin_x + 40,
                y: currentY,
                size: 10,
                font: helvetica,
                color: rgb(0.4, 0.4, 0.4)
              });
              currentY -= 15;
            });
          }
          
          currentY -= 10;
        });
      }
    }
    
    // Custom Services Section
    if (customServices.length > 0) {
      currentY -= 20;
      
      page.drawText("Serviços Personalizados", {
        x: margin_x,
        y: currentY,
        size: 16,
        font: helveticaBold,
        color: rgb(0.96, 0.51, 0.13)
      });
      
      currentY -= 30;
      
      customServices.forEach(service => {
        const quantity = service.metadata?.quantity || 1;
        const serviceText = quantity > 1 ? `${quantity}x ${service.name}` : service.name;
        
        page.drawText(serviceText, {
          x: margin_x,
          y: currentY,
          size: 12,
          font: helveticaBold,
          color: rgb(0, 0, 0)
        });
        
        page.drawText(formatCurrency(service.price), {
          x: width - margin_x - 100,
          y: currentY,
          size: 12,
          font: helvetica,
          color: rgb(0, 0, 0)
        });
        
        currentY -= 20;
        
        if (service.description) {
          page.drawText(service.description, {
            x: margin_x + 20,
            y: currentY,
            size: 10,
            font: helvetica,
            color: rgb(0.4, 0.4, 0.4)
          });
          currentY -= 15;
        }
        
        if (service.specs) {
          service.specs.forEach(spec => {
            page.drawText(`• ${spec}`, {
              x: margin_x + 20,
              y: currentY,
              size: 10,
              font: helvetica,
              color: rgb(0.4, 0.4, 0.4)
            });
            currentY -= 15;
          });
        }
        
        currentY -= 10;
      });
    }
    
    // Financial Summary
    currentY -= 30;
    
    // Calculate totals
    const componentsPrice = Object.values(selectedComponents).reduce(
      (sum, component) => sum + component.price,
      0
    );
    
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
    
    page.drawText("Resumo Financeiro", {
      x: margin_x,
      y: currentY,
      size: 16,
      font: helveticaBold,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    currentY -= 30;
    
    // Subtotal
    page.drawText("Subtotal:", {
      x: margin_x,
      y: currentY,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(subtotal), {
      x: width - margin_x - 100,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    
    currentY -= 20;
    
    // Margin
    page.drawText(`Margem (${margin}%):`, {
      x: margin_x,
      y: currentY,
      size: 12,
      font: helvetica,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(profit), {
      x: width - margin_x - 100,
      y: currentY,
      size: 12,
      font: helveticaBold,
      color: rgb(0.96, 0.51, 0.13)
    });
    
    currentY -= 30;
    
    // Total
    page.drawText("Total Mensal:", {
      x: margin_x,
      y: currentY,
      size: 14,
      font: helveticaBold,
      color: rgb(0, 0, 0)
    });
    
    page.drawText(formatCurrency(total), {
      x: width - margin_x - 100,
      y: currentY,
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
