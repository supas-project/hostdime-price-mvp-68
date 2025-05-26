
import { RGB } from 'pdf-lib';

export const COLOR = {
  PRIMARY: { r: 1, g: 0.4, b: 0 } as RGB, // Orange HostDime
  SECONDARY: { r: 0.2, g: 0.2, b: 0.2 } as RGB,
  ACCENT: { r: 1, g: 0.4, b: 0 } as RGB, // Orange accent
  SUCCESS: { r: 0, g: 0.7, b: 0 } as RGB,
  TEXT: { r: 0.2, g: 0.2, b: 0.2 } as RGB,
  TEXT_LIGHT: { r: 0.5, g: 0.5, b: 0.5 } as RGB,
  MUTED: { r: 0.5, g: 0.5, b: 0.5 } as RGB,
  WHITE: { r: 1, g: 1, b: 1 } as RGB,
  BACKGROUND: { r: 0.98, g: 0.98, b: 0.98 } as RGB,
  HIGHLIGHT: { r: 1, g: 0.95, b: 0.9 } as RGB, // Light orange for highlights
  PRIMARY_LIGHT: { r: 1, g: 0.9, b: 0.8 } as RGB,
  TABLE_ROW_ALT: { r: 0.99, g: 0.99, b: 0.99 } as RGB,
  BORDER: { r: 0.9, g: 0.9, b: 0.9 } as RGB
} as const;
