
// Re-export all drawing utilities from their respective files
export * from './layout';
export * from './page';
export * from './section';
export * from './text';
export * from './images';

// Helper para sanitização de textos no PDF - versão mais robusta
export function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  
  try {
    // Primeiro passo: substituições diretas para caracteres problemáticos comuns em português
    const replacements: Record<string, string> = {
      'á': 'a', 'à': 'a', 'â': 'a', 'ã': 'a', 'ä': 'a',
      'é': 'e', 'è': 'e', 'ê': 'e', 'ë': 'e',
      'í': 'i', 'ì': 'i', 'î': 'i', 'ï': 'i',
      'ó': 'o', 'ò': 'o', 'ô': 'o', 'õ': 'o', 'ö': 'o',
      'ú': 'u', 'ù': 'u', 'û': 'u', 'ü': 'u',
      'ç': 'c', 'ñ': 'n',
      '°': ' graus',
      '²': '2',
      '³': '3',
      '£': 'GBP',
      '€': 'EUR',
      '©': '(c)',
      '®': '(r)',
      '™': '(tm)',
      '✓': 'x',
      '✔': 'x',
      '√': 'x'
    };

    // Aplicar substituições diretas
    let result = String(text);
    for (const [special, replacement] of Object.entries(replacements)) {
      result = result.replace(new RegExp(special, 'g'), replacement);
    }
    
    // Segundo passo: remover caracteres não-ASCII que não foram tratados nas substituições
    result = result.replace(/[^\x00-\x7F]/g, '');
    
    // Terceiro passo: remover caracteres de controle e outros potencialmente problemáticos
    result = result.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    return result;
  } catch (err) {
    console.error("Erro ao sanitizar texto:", err);
    // Fallback mais agressivo em caso de erro: apenas ASCII básico
    return String(text).replace(/[^\x20-\x7E]/g, '');
  }
}
