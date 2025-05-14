
// Re-export all drawing utilities from their respective files
export * from './layout';
export * from './page';
export * from './section';
export * from './text';
export * from './images';

// Helper para sanitização de textos no PDF
export function sanitizeText(text: string | undefined): string {
  if (!text) return '';
  
  // Substituir caracteres problemáticos com alternativas seguras
  return String(text)
    .replace(/[√✓✔]/g, 'x') // Substitui marcas de verificação por 'x'
    .replace(/[^\x00-\x7F]/g, (char) => {
      // Substituições específicas para acentos comuns em português
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
        '™': '(tm)'
      };
      
      return replacements[char] || '';
    });
}
