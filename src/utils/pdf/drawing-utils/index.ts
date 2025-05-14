
// Re-export all drawing utilities from their respective files
export * from './layout';
export * from './page';
export * from './section';
export * from './text';
export * from './images';

// Enhanced text sanitization function for PDF generation
export function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  
  try {
    // Direct replacements for common problematic Portuguese characters
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
      '✓': 'v',
      '✔': 'v',
      '√': 'v',
      '/': '-', // Adicionar substituição específica para a barra "/" que está causando o erro
      '\\': '-' // Também substituir a contrabarra por segurança
    };

    // Apply direct replacements
    let result = String(text);
    for (const [special, replacement] of Object.entries(replacements)) {
      result = result.replace(new RegExp(special, 'g'), replacement);
    }
    
    // Remove non-ASCII characters not handled in replacements
    result = result.replace(/[^\x00-\x7F]/g, '');
    
    // Remove control characters and other potentially problematic ones
    result = result.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
    
    return result;
  } catch (err) {
    console.error("Erro ao sanitizar texto:", err);
    // More aggressive fallback in case of error: only basic ASCII
    return String(text).replace(/[^\x20-\x7E]/g, '');
  }
}
