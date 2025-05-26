
import { rgb } from 'pdf-lib';

export const COLOR = {
  PRIMARY: rgb(1, 0.4, 0), // Orange HostDime
  SECONDARY: rgb(0.2, 0.2, 0.2),
  ACCENT: rgb(1, 0.4, 0), // Orange accent
  SUCCESS: rgb(0, 0.7, 0),
  TEXT: rgb(0.2, 0.2, 0.2),
  TEXT_LIGHT: rgb(0.5, 0.5, 0.5),
  MUTED: rgb(0.5, 0.5, 0.5),
  WHITE: rgb(1, 1, 1),
  BACKGROUND: rgb(0.98, 0.98, 0.98),
  HIGHLIGHT: rgb(1, 0.95, 0.9), // Light orange for highlights
  PRIMARY_LIGHT: rgb(1, 0.9, 0.8),
  TABLE_ROW_ALT: rgb(0.99, 0.99, 0.99),
  BORDER: rgb(0.9, 0.9, 0.9)
} as const;
