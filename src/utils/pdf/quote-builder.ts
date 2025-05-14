
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { ComponentOption } from "@/types/component";
import { toast } from "sonner";
import { renderHeaderSection } from './section-renderers/header-section';
import { renderSummarySection } from './section-renderers/summary-section';
import { renderComponentsSection } from './section-renderers/components-section';
import { renderStorageSection } from './section-renderers/storage-section';
import { renderServicesSection } from './section-renderers/services-section';
import { renderFinancialSection } from './section-renderers/financial-section';
import { renderBenefitsSection } from './section-renderers/benefits-section';
import { renderTermsSection } from './section-renderers/terms-section';
import { QuoteVariables } from './dynamic-variables';

// Função para sanitizar texto, removendo caracteres problemáticos
function sanitizeText(text: string): string {
  if (!text) return '';
  
  // Substituir caracteres problemáticos com alternativas seguras
  return text
    .replace(/[√✓✔]/g, 'x') // Substitui caracteres de marca de verificação por 'x'
    .replace(/[^\x00-\x7F]/g, '') // Remove caracteres não ASCII
    .replace(/[^\w\s.,;:!?()[\]{}\-+*/&%$#@='"]/g, ''); // Mantém apenas caracteres básicos
}

// Função para sanitizar objeto de componente
function sanitizeComponent(component: ComponentOption): ComponentOption {
  if (!component) return component;
  
  return {
    ...component,
    name: sanitizeText(component.name),
    description: sanitizeText(component.description || ''),
    details: component.details?.map(d => sanitizeText(d)) || [],
  };
}

export async function buildQuotePDF(
  selectedComponents: { [key: string]: ComponentOption },
  storageItems: { internal: ComponentOption[]; external: ComponentOption[] },
  customServices: ComponentOption[],
  margin: number,
  connectivityItems: { [key: string]: { option: ComponentOption, quantity: number } } = {},
  quoteVariables?: Partial<QuoteVariables>
): Promise<Uint8Array> {
  try {
    toast.info("Gerando PDF...", {
      description: "Aguarde enquanto preparamos seu documento"
    });
    
    // Sanitizar dados de entrada para evitar problemas de codificação
    const sanitizedComponents: { [key: string]: ComponentOption } = {};
    for (const key in selectedComponents) {
      if (selectedComponents[key]) {
        sanitizedComponents[key] = sanitizeComponent(selectedComponents[key]);
      }
    }
    
    const sanitizedStorageItems = {
      internal: storageItems.internal.map(item => sanitizeComponent(item)),
      external: storageItems.external.map(item => sanitizeComponent(item))
    };
    
    const sanitizedCustomServices = customServices.map(service => sanitizeComponent(service));
    
    const sanitizedConnectivityItems: typeof connectivityItems = {};
    for (const key in connectivityItems) {
      if (connectivityItems[key]) {
        sanitizedConnectivityItems[key] = {
          option: sanitizeComponent(connectivityItems[key].option),
          quantity: connectivityItems[key].quantity
        };
      }
    }
    
    // Criar documento PDF
    const pdfDoc = await PDFDocument.create();
    
    // Carregar fontes
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
    
    // Configurar primeira página do PDF
    let page = pdfDoc.addPage([595.276, 841.890]); // Dimensões A4
    const { width, height } = page.getSize();
    
    // Definir margens
    const marginX = 50;
    const marginRight = width - marginX;
    
    // 1. Seção de cabeçalho - redesenhada
    const { currentY, quoteNumber } = await renderHeaderSection(
      pdfDoc, page, width, height, helvetica, helveticaBold, marginX, quoteVariables
    );
    
    // 2. Seção de resumo - com estilo moderno
    let newY = renderSummarySection(
      page, currentY, width, marginX, helveticaBold, helvetica
    );
    
    // 3. Seção de componentes
    let pageContext = renderComponentsSection(
      pdfDoc, { page, y: newY }, sanitizedComponents, width, marginX, 
      marginRight, helvetica, helveticaBold, helveticaOblique
    );
    
    // 4. Seção de armazenamento
    pageContext = renderStorageSection(
      pdfDoc, pageContext, sanitizedStorageItems, width, marginX, 
      marginRight, helvetica, helveticaBold, helveticaOblique
    );
    
    // 5. Seção de serviços
    pageContext = renderServicesSection(
      pdfDoc, pageContext, sanitizedCustomServices, width, marginX, 
      marginRight, helvetica, helveticaBold, helveticaOblique
    );
    
    // 6. Resumo financeiro
    pageContext = renderFinancialSection(
      pdfDoc, pageContext, sanitizedComponents, sanitizedStorageItems, sanitizedCustomServices, 
      margin, width, marginX, marginRight, helvetica, helveticaBold,
      sanitizedConnectivityItems
    );
    
    // 7. Seção de benefícios
    pageContext = renderBenefitsSection(
      pdfDoc, pageContext, marginX, helvetica, helveticaBold
    );
    
    // 8. Termos e condições
    renderTermsSection(
      pdfDoc, pageContext, marginX, helvetica, helveticaBold, quoteVariables?.observacoes
    );
    
    // Finalizar e retornar bytes do PDF
    return await pdfDoc.save();
    
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    toast.error("Falha ao gerar PDF", {
      description: (error as Error).message
    });
    throw new Error("Falha na geração do PDF: " + (error as Error).message);
  }
}

// Helper function to trigger PDF download
export function downloadPDF(pdfBytes: Uint8Array, fileName: string): void {
  // Create blob and trigger download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  
  // Success notification
  toast.success("PDF Gerado com Sucesso", {
    description: "Seu documento foi baixado automaticamente"
  });
}

// Nova função para abrir o PDF em uma nova aba
export function openPDFInNewTab(pdfBytes: Uint8Array, fileName: string): void {
  try {
    // Criar blob e URL para visualização
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Abrir em nova aba
    const newTab = window.open(blobUrl, '_blank');
    
    if (newTab) {
      newTab.focus();
      toast.success("PDF Gerado com Sucesso", {
        description: "O documento foi aberto em uma nova aba"
      });
    } else {
      // Fallback se o navegador bloquear popups
      toast.warning("Popup bloqueado pelo navegador", {
        description: "Tente permitir popups para este site ou faça o download direto"
      });
      
      // Fallback para download direto
      downloadPDF(pdfBytes, fileName);
    }
    
    // Limpar URL após um tempo para liberar memória
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl);
    }, 30000);
  } catch (error) {
    console.error("Erro ao abrir PDF:", error);
    toast.error("Falha ao abrir PDF", {
      description: "Tentando fazer o download direto como alternativa"
    });
    
    // Tentar fazer o download como fallback
    try {
      downloadPDF(pdfBytes, fileName);
    } catch (downloadError) {
      console.error("Erro no fallback de download:", downloadError);
      toast.error("Falha completa na geração do PDF", {
        description: "Contate o suporte técnico"
      });
    }
  }
}
