
import { rgb, RGB } from 'pdf-lib';
import { PdfColorScheme } from './types';

// CORREÇÃO: Ajuste das cores para se alinharem melhor com a identidade visual da HostDime
export const COLOR: PdfColorScheme = {
  PRIMARY: rgb(0.98, 0.40, 0.00),      // HostDime Orange (FF6600) - Ajustado para exatamente o tom laranja HostDime
  SECONDARY: rgb(0.12, 0.12, 0.17),    // Dark Blue/Black (#1E1F2C) - Mais escuro para melhor contraste
  PRIMARY_LIGHT: rgb(1.00, 0.70, 0.50), // Light Orange - Ajustado para melhor complementar o laranja principal
  TEXT: rgb(0.10, 0.10, 0.12),         // Darkest Text color for better readability (#191A1F)
  TEXT_LIGHT: rgb(0.30, 0.30, 0.35),   // Secondary text (#4D4E59) - Mais escuro para melhor legibilidade
  ACCENT: rgb(0.55, 0.60, 0.65),       // Accent color (#8C99A6)
  WHITE: rgb(1, 1, 1),                 // White
  BACKGROUND: rgb(0.98, 0.98, 0.98),   // Background color - Ligeiramente mais claro
  HIGHLIGHT: rgb(1.0, 0.95, 0.90),     // Very light orange highlight (#FFF2E6)
  TABLE_ROW_ALT: rgb(0.96, 0.96, 0.98)  // Subtle alternating row color (#F5F5FA) - Mais neutro
};
