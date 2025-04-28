
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { ComponentOption } from "@/types/component";
import { formatCurrency } from "@/lib/utils";

// Definição de cores da marca HostDime
const PRIMARY_COLOR = rgb(0.96, 0.51, 0.13); // #f58220
const TEXT_COLOR = rgb(0.12, 0.12, 0.12); // #1e1e1e
const MUTED_COLOR = rgb(0.4, 0.4, 0.4); // text-muted
const WHITE = rgb(1, 1, 1); // #ffffff
const BLUE_COLOR = rgb(0.2, 0.6, 0.9); // azul institucional

/**
 * Gera um PDF completo com o template da HostDime
 */
export async function generateQuoteFromTemplate(
  selectedComponents: { [key: string]: ComponentOption },
  margin: number
): Promise<Uint8Array> {
  // Criar um novo documento PDF
  const pdfDoc = await PDFDocument.create();
  
  // Carregar fontes
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
  
  // Gerar as diferentes páginas do documento
  await addCoverPage(pdfDoc, boldFont, font);
  await addInstitutionalPage(pdfDoc, boldFont, font);
  await addConfidentialityPage(pdfDoc, boldFont, font);
  await addQuotePage(pdfDoc, selectedComponents, margin, boldFont, font);
  await addDataCenterPage(pdfDoc, boldFont, font);
  await addContactPage(pdfDoc, boldFont, font);
  
  // Retornar o PDF finalizado
  return pdfDoc.save();
}

/**
 * Adiciona a página de capa com logo da HostDime
 */
async function addCoverPage(pdfDoc: PDFDocument, boldFont: any, font: any) {
  const page = pdfDoc.addPage([595.276, 841.890]); // Tamanho A4
  const { width, height } = page.getSize();
  
  // Fundo colorido na parte superior
  page.drawRectangle({
    x: 0,
    y: height * 0.5,
    width: width,
    height: height * 0.5,
    color: PRIMARY_COLOR,
  });
  
  // Logo HostDime (posicionado como texto por enquanto)
  page.drawText("HostDime", {
    x: width / 2 - 80,
    y: height * 0.7,
    size: 36,
    font: boldFont,
    color: WHITE
  });
  
  page.drawText("PROPOSTA COMERCIAL", {
    x: width / 2 - 120,
    y: height * 0.6,
    size: 24,
    font: boldFont,
    color: WHITE
  });
  
  // Data do documento
  const today = new Date().toLocaleDateString('pt-BR');
  page.drawText(`Data: ${today}`, {
    x: 50,
    y: height * 0.45,
    size: 12,
    font,
    color: TEXT_COLOR
  });
  
  // Slogan
  page.drawText("ABRA ESPAÇO PARA A INOVAÇÃO", {
    x: width / 2 - 150,
    y: height * 0.2,
    size: 20,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  // Rodapé
  drawFooter(page, width, font);
}

/**
 * Adiciona a página institucional com informações da empresa
 */
async function addInstitutionalPage(pdfDoc: PDFDocument, boldFont: any, font: any) {
  const page = pdfDoc.addPage([595.276, 841.890]);
  const { width, height } = page.getSize();
  const margin = 50;
  let currentY = height - margin;
  
  // Título da página
  page.drawText("Quem Somos", {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 40;
  
  // Texto institucional
  const institutionalText = "A HostDime é uma empresa global de data center e infraestrutura de nuvem com mais de 20 anos de experiência. Nossa missão é fornecer serviços de hospedagem e colocation de classe mundial com suporte técnico 24/7 em nossos data centers certificados.";
  
  const lines = wrapText(institutionalText, font, 11, width - 2 * margin);
  for (const line of lines) {
    page.drawText(line, {
      x: margin,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  currentY -= 20;
  
  // Seção de presença global
  page.drawText("Presença Global", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 30;
  
  // Lista de países (simulando o mapa)
  const countries = [
    "Brasil - Data Centers em São Paulo e João Pessoa",
    "Estados Unidos - Data Center em Orlando, Flórida",
    "Colômbia - Data Center em Bogotá",
    "México - Data Center na Cidade do México",
    "Holanda - Data Center em Amsterdam"
  ];
  
  for (const country of countries) {
    page.drawText(`• ${country}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  currentY -= 30;
  
  // Certificações
  page.drawText("Certificações", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 30;
  
  const certifications = [
    "ISO 27001 - Segurança da Informação",
    "PCI DSS - Segurança de Dados do Cartão de Pagamento",
    "ISAE 3402/SOC 1 Type II",
    "Uptime Institute Tier III"
  ];
  
  for (const cert of certifications) {
    page.drawText(`• ${cert}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  // Rodapé
  drawFooter(page, width, font);
}

/**
 * Adiciona a página de acordo de confidencialidade
 */
async function addConfidentialityPage(pdfDoc: PDFDocument, boldFont: any, font: any) {
  const page = pdfDoc.addPage([595.276, 841.890]);
  const { width, height } = page.getSize();
  const margin = 50;
  let currentY = height - margin;
  
  // Título da página
  page.drawText("Acordo de Confidencialidade", {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 40;
  
  // Texto do acordo
  const confidentialityText = "Este documento contém informações confidenciais e proprietárias da HostDime Brasil. A divulgação, distribuição ou cópia deste documento sem autorização prévia é estritamente proibida. Este material destina-se apenas ao destinatário especificado. Se você recebeu este documento por engano, notifique-nos imediatamente.";
  
  const lines = wrapText(confidentialityText, font, 11, width - 2 * margin);
  for (const line of lines) {
    page.drawText(line, {
      x: margin,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  currentY -= 40;
  
  // Informações adicionais
  page.drawText("Informações Importantes", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 30;
  
  const additionalInfo = [
    "Os preços apresentados nesta proposta têm validade de 15 dias.",
    "Todos os valores estão em Reais (BRL) e incluem impostos aplicáveis.",
    "Esta proposta não constitui um contrato vinculativo até que seja aceita e assinada por ambas as partes.",
    "O SLA (Acordo de Nível de Serviço) está detalhado em documento separado."
  ];
  
  for (const info of additionalInfo) {
    page.drawText(`• ${info}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  // Rodapé
  drawFooter(page, width, font);
}

/**
 * Adiciona a página com a cotação do servidor
 */
async function addQuotePage(
  pdfDoc: PDFDocument, 
  selectedComponents: { [key: string]: ComponentOption }, 
  margin: number,
  boldFont: any,
  font: any
) {
  const page = pdfDoc.addPage([595.276, 841.890]);
  const { width, height } = page.getSize();
  const margin_x = 50;
  let currentY = height - 80;
  
  // Cabeçalho da cotação
  page.drawText("Proposta Comercial - Servidor Dedicado", {
    x: margin_x,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PRIMARY_COLOR,
  });
  
  currentY -= 30;
  
  page.drawText(`Data: ${new Date().toLocaleDateString('pt-BR')}`, {
    x: margin_x,
    y: currentY,
    size: 12,
    font,
    color: MUTED_COLOR,
  });
  
  currentY -= 50;
  
  // Especificações Técnicas
  page.drawText("Especificações Técnicas", {
    x: margin_x,
    y: currentY,
    size: 16,
    font: boldFont,
    color: TEXT_COLOR,
  });
  
  currentY -= 20;
  
  // Desenhar tabela de componentes
  const tableTop = currentY;
  const tableWidth = width - 2 * margin_x;
  const colWidths = [0.35 * tableWidth, 0.5 * tableWidth, 0.15 * tableWidth];
  const rowHeight = 25;
  
  // Cabeçalho da tabela
  page.drawRectangle({
    x: margin_x,
    y: currentY - rowHeight,
    width: tableWidth,
    height: rowHeight,
    color: PRIMARY_COLOR,
  });
  
  page.drawText("Componente", {
    x: margin_x + 5,
    y: currentY - rowHeight/2 - 5,
    size: 12,
    font: boldFont,
    color: WHITE,
  });
  
  page.drawText("Especificação", {
    x: margin_x + colWidths[0] + 5,
    y: currentY - rowHeight/2 - 5,
    size: 12,
    font: boldFont,
    color: WHITE,
  });
  
  page.drawText("Valor Mensal", {
    x: margin_x + colWidths[0] + colWidths[1] + 5,
    y: currentY - rowHeight/2 - 5,
    size: 12,
    font: boldFont,
    color: WHITE,
  });
  
  currentY -= rowHeight;
  
  // Corpo da tabela com os componentes
  let rowColor = true;
  for (const [key, component] of Object.entries(selectedComponents)) {
    // Desenhar fundo alternado das linhas
    page.drawRectangle({
      x: margin_x,
      y: currentY - rowHeight,
      width: tableWidth,
      height: rowHeight,
      color: rowColor ? rgb(0.95, 0.95, 0.95) : rgb(1, 1, 1),
    });
    
    // Nome do componente
    page.drawText(component.name, {
      x: margin_x + 5,
      y: currentY - rowHeight/2 - 5,
      size: 10,
      font: boldFont,
      color: TEXT_COLOR,
    });
    
    // Descrição/especificação
    page.drawText(component.description || "", {
      x: margin_x + colWidths[0] + 5,
      y: currentY - rowHeight/2 - 5,
      size: 10,
      font,
      color: TEXT_COLOR,
    });
    
    // Preço
    page.drawText(formatCurrency(component.price || 0), {
      x: margin_x + colWidths[0] + colWidths[1] + 5,
      y: currentY - rowHeight/2 - 5,
      size: 10,
      font,
      color: TEXT_COLOR,
    });
    
    currentY -= rowHeight;
    rowColor = !rowColor;
    
    // Verificar se precisa de quebra de página
    if (currentY < 200) {
      // Desenhar o rodapé na página atual
      drawFooter(page, width, font);
      
      // Criar nova página
      const newPage = pdfDoc.addPage([595.276, 841.890]);
      page = newPage;
      currentY = height - 80;
      
      // Continuar cabeçalho na nova página
      page.drawText("Especificações Técnicas (continuação)", {
        x: margin_x,
        y: currentY,
        size: 16,
        font: boldFont,
        color: TEXT_COLOR,
      });
      
      currentY -= 30;
    }
  }
  
  // Desenhar bordas da tabela
  page.drawLine({
    start: { x: margin_x, y: tableTop },
    end: { x: margin_x + tableWidth, y: tableTop },
    thickness: 1,
    color: PRIMARY_COLOR,
  });
  
  page.drawLine({
    start: { x: margin_x, y: currentY },
    end: { x: margin_x + tableWidth, y: currentY },
    thickness: 1,
    color: PRIMARY_COLOR,
  });
  
  page.drawLine({
    start: { x: margin_x, y: tableTop },
    end: { x: margin_x, y: currentY },
    thickness: 1,
    color: PRIMARY_COLOR,
  });
  
  page.drawLine({
    start: { x: margin_x + tableWidth, y: tableTop },
    end: { x: margin_x + tableWidth, y: currentY },
    thickness: 1,
    color: PRIMARY_COLOR,
  });
  
  // Linhas verticais internas
  page.drawLine({
    start: { x: margin_x + colWidths[0], y: tableTop },
    end: { x: margin_x + colWidths[0], y: currentY },
    thickness: 0.5,
    color: MUTED_COLOR,
  });
  
  page.drawLine({
    start: { x: margin_x + colWidths[0] + colWidths[1], y: tableTop },
    end: { x: margin_x + colWidths[0] + colWidths[1], y: currentY },
    thickness: 0.5,
    color: MUTED_COLOR,
  });
  
  currentY -= 40;
  
  // Resumo Financeiro
  page.drawText("Resumo Financeiro", {
    x: margin_x,
    y: currentY,
    size: 16,
    font: boldFont,
    color: TEXT_COLOR,
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
    borderColor: PRIMARY_COLOR,
    borderWidth: 1,
    color: rgb(0.98, 0.98, 0.98)
  });
  
  // Subtotal
  page.drawText("Subtotal:", {
    x: width - margin_x - 240,
    y: currentY - 25,
    size: 12,
    font,
    color: TEXT_COLOR,
  });
  
  page.drawText(formatCurrency(subtotal), {
    x: width - margin_x - 80,
    y: currentY - 25,
    size: 12,
    font: boldFont,
    color: TEXT_COLOR,
  });
  
  // Margem
  page.drawText(`Margem (${margin}%):`, {
    x: width - margin_x - 240,
    y: currentY - 50,
    size: 12,
    font,
    color: TEXT_COLOR,
  });
  
  page.drawText(formatCurrency(profit), {
    x: width - margin_x - 80,
    y: currentY - 50,
    size: 12,
    font: boldFont,
    color: PRIMARY_COLOR,
  });
  
  // Linha separadora
  page.drawLine({
    start: { x: width - margin_x - 240, y: currentY - 60 },
    end: { x: width - margin_x - 10, y: currentY - 60 },
    thickness: 1,
    color: MUTED_COLOR,
  });
  
  // Total
  page.drawText("Total Mensal:", {
    x: width - margin_x - 240,
    y: currentY - 85,
    size: 14,
    font: boldFont,
    color: TEXT_COLOR,
  });
  
  page.drawText(formatCurrency(total), {
    x: width - margin_x - 80,
    y: currentY - 85,
    size: 14,
    font: boldFont,
    color: PRIMARY_COLOR,
  });
  
  // Condições comerciais
  currentY -= 140;
  
  page.drawText("Condições Comerciais", {
    x: margin_x,
    y: currentY,
    size: 16,
    font: boldFont,
    color: TEXT_COLOR,
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
      color: TEXT_COLOR,
    });
    
    page.drawText(condition.value, {
      x: margin_x + 180,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR,
    });
    
    currentY -= 20;
  }
  
  // Rodapé
  drawFooter(page, width, font);
}

/**
 * Adiciona a página com informações dos Data Centers
 */
async function addDataCenterPage(pdfDoc: PDFDocument, boldFont: any, font: any) {
  const page = pdfDoc.addPage([595.276, 841.890]);
  const { width, height } = page.getSize();
  const margin = 50;
  let currentY = height - margin;
  
  // Título da página
  page.drawText("Nossos Data Centers", {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 40;
  
  // Data Center de João Pessoa
  page.drawText("Data Center Nordeste - João Pessoa", {
    x: margin,
    y: currentY,
    size: 18,
    font: boldFont,
    color: TEXT_COLOR
  });
  
  currentY -= 30;
  
  const jpFeatures = [
    "Certificação Tier III",
    "5.000m² de área total",
    "1MW de capacidade energética",
    "Redundância N+1 em todos os sistemas",
    "Conectividade com múltiplos provedores",
    "Sistema contra incêndio com gás FM-200",
    "Segurança física 24x7"
  ];
  
  for (const feature of jpFeatures) {
    page.drawText(`• ${feature}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  currentY -= 30;
  
  // Data Center de São Paulo
  page.drawText("Data Center São Paulo", {
    x: margin,
    y: currentY,
    size: 18,
    font: boldFont,
    color: TEXT_COLOR
  });
  
  currentY -= 30;
  
  const spFeatures = [
    "Localizado no maior hub de conectividade da América Latina",
    "Certificação Tier III",
    "Redundância 2N em energia e refrigeração",
    "Conectividade direta com PTT-SP",
    "Baixa latência para toda América do Sul",
    "Segurança avançada com biometria"
  ];
  
  for (const feature of spFeatures) {
    page.drawText(`• ${feature}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  currentY -= 30;
  
  // Diferenciais
  page.drawText("Diferenciais HostDime", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 30;
  
  const differentials = [
    "Suporte Técnico 24/7/365 em português",
    "Monitoramento proativo de todos os servidores",
    "Portal de gerenciamento exclusivo",
    "Atendimento personalizado com gerente de conta dedicado",
    "Flexibilidade para crescimento conforme necessidade"
  ];
  
  for (const diff of differentials) {
    page.drawText(`• ${diff}`, {
      x: margin + 10,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  // Rodapé
  drawFooter(page, width, font);
}

/**
 * Adiciona a página de contato e encerramento
 */
async function addContactPage(pdfDoc: PDFDocument, boldFont: any, font: any) {
  const page = pdfDoc.addPage([595.276, 841.890]);
  const { width, height } = page.getSize();
  const margin = 50;
  let currentY = height - margin;
  
  // Título da página
  page.drawText("Entre em Contato", {
    x: margin,
    y: currentY,
    size: 24,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 40;
  
  // Texto sobre contato
  const contactText = "Estamos à disposição para esclarecer quaisquer dúvidas sobre esta proposta e adaptar nossa solução às necessidades específicas do seu negócio.";
  
  const lines = wrapText(contactText, font, 11, width - 2 * margin);
  for (const line of lines) {
    page.drawText(line, {
      x: margin,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR
    });
    currentY -= 20;
  }
  
  currentY -= 30;
  
  // Informações de contato
  page.drawText("Contatos", {
    x: margin,
    y: currentY,
    size: 16,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 30;
  
  const contacts = [
    { label: "Telefone:", value: "+55 (83) 3512-3100" },
    { label: "E-mail:", value: "vendas@hostdime.com.br" },
    { label: "Website:", value: "www.hostdime.com.br" },
    { label: "Endereço:", value: "Avenida João Cirilo da Silva, 1901 - Altiplano, João Pessoa - PB" }
  ];
  
  for (const contact of contacts) {
    page.drawText(contact.label, {
      x: margin,
      y: currentY,
      size: 11,
      font: boldFont,
      color: TEXT_COLOR,
    });
    
    page.drawText(contact.value, {
      x: margin + 80,
      y: currentY,
      size: 11,
      font,
      color: TEXT_COLOR,
    });
    
    currentY -= 20;
  }
  
  currentY -= 50;
  
  // Texto de agradecimento
  page.drawText("Agradecemos a oportunidade de apresentar nossa proposta", {
    x: width / 2 - 180,
    y: currentY,
    size: 12,
    font: boldFont,
    color: PRIMARY_COLOR
  });
  
  currentY -= 20;
  
  page.drawText("HostDime Brasil - Soluções em Infraestrutura de Data Center", {
    x: width / 2 - 180,
    y: currentY,
    size: 12,
    font: italicFont,
    color: TEXT_COLOR
  });
  
  // Rodapé
  drawFooter(page, width, font);
}

/**
 * Função auxiliar para desenhar o rodapé padrão
 */
function drawFooter(page: any, pageWidth: number, font: any) {
  const footerY = 30;
  
  // Linha separadora
  page.drawLine({
    start: { x: 50, y: footerY + 15 },
    end: { x: pageWidth - 50, y: footerY + 15 },
    thickness: 1,
    color: MUTED_COLOR,
  });
  
  // Texto do rodapé
  page.drawText("HostDime Brasil | www.hostdime.com.br | 0800 200 8532", {
    x: pageWidth / 2 - 150,
    y: footerY,
    size: 9,
    font,
    color: MUTED_COLOR,
  });
}

/**
 * Função auxiliar para quebrar texto em múltiplas linhas
 */
function wrapText(text: string, font: any, fontSize: number, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const width = font.widthOfTextAtSize(`${currentLine} ${word}`.trim(), fontSize);
    
    if (width < maxWidth) {
      currentLine = `${currentLine} ${word}`.trim();
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}
