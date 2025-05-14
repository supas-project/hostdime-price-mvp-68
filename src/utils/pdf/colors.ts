
import { rgb, RGB } from 'pdf-lib';
import { PdfColorScheme } from './types';

// Paleta de cores modernizada para um visual mais profissional e contemporâneo
export const COLOR: PdfColorScheme = {
  PRIMARY: rgb(0.96, 0.51, 0.13),      // HostDime Orange (#f58220)
  SECONDARY: rgb(0.08, 0.10, 0.14),    // Dark Blue - mais escuro e moderno (#141923)
  PRIMARY_LIGHT: rgb(0.99, 0.70, 0.45), // Light Orange - mais suave (#fd9972)
  TEXT: rgb(0.15, 0.17, 0.21),         // Texto mais escuro para melhor leitura (#262A36)
  TEXT_LIGHT: rgb(0.35, 0.37, 0.41),   // Texto secundário mais contrastante (#5A5E68)
  ACCENT: rgb(0.08, 0.65, 0.91),       // Azul moderno como cor de destaque (#149BE8)
  WHITE: rgb(1, 1, 1),                 // Branco
  BACKGROUND: rgb(0.98, 0.98, 0.99),   // Background ligeiramente azulado para um look profissional (#FAFAFD)
  HIGHLIGHT: rgb(0.99, 0.97, 0.93),    // Creme de destaque mais elegante (#FDF7ED)
  TABLE_ROW_ALT: rgb(0.96, 0.97, 0.98) // Linhas alternadas mais sutis (#F5F7FA)
};
