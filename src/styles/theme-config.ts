
/**
 * HostDime Design System
 * 
 * Este arquivo centraliza as configurações visuais e define
 * padrões de design para garantir consistência em toda a aplicação.
 */

export const hostdimeColors = {
  // Cores primárias
  primary: {
    DEFAULT: "#FF6600", // Laranja HostDime
    hover: "#E55A00",
    light: "#FF8533",
    dark: "#CC5200",
    foreground: "#FFFFFF"
  },
  
  // Tons de preto e cinza
  neutral: {
    900: "#1E1E1E", // Preto principal
    800: "#2A2A2A",
    700: "#3D3D3D",
    600: "#525252",
    500: "#6E6E6E",
    400: "#8E8E8E",
    300: "#B0B0B0",
    200: "#D1D1D1",
    100: "#E8E8E8",
    50: "#F5F5F5"
  },
  
  // Cores de feedback
  success: {
    DEFAULT: "#10B981",
    light: "#ECFDF5",
    dark: "#059669"
  },
  warning: {
    DEFAULT: "#F59E0B",
    light: "#FFFBEB",
    dark: "#D97706"
  },
  error: {
    DEFAULT: "#EF4444",
    light: "#FEF2F2",
    dark: "#DC2626"
  },
  info: {
    DEFAULT: "#3B82F6",
    light: "#EFF6FF",
    dark: "#2563EB"
  }
};

export const hostdimeSpacing = {
  // Espaçamentos padrão (em pixels)
  0: "0px",
  0.5: "0.125rem", // 2px
  1: "0.25rem",    // 4px
  1.5: "0.375rem", // 6px
  2: "0.5rem",     // 8px
  2.5: "0.625rem", // 10px
  3: "0.75rem",    // 12px
  3.5: "0.875rem", // 14px
  4: "1rem",       // 16px
  5: "1.25rem",    // 20px
  6: "1.5rem",     // 24px
  8: "2rem",       // 32px
  10: "2.5rem",    // 40px
  12: "3rem",      // 48px
  16: "4rem",      // 64px
};

export const hostdimeTypography = {
  // Tamanhos de fonte
  size: {
    xs: "0.75rem",      // 12px
    sm: "0.875rem",     // 14px
    base: "1rem",       // 16px
    lg: "1.125rem",     // 18px
    xl: "1.25rem",      // 20px
    "2xl": "1.5rem",    // 24px
    "3xl": "1.875rem",  // 30px
    "4xl": "2.25rem",   // 36px
    "5xl": "3rem",      // 48px
  },
  
  // Pesos da fonte
  weight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  // Altura de linha
  lineHeight: {
    none: "1",
    tight: "1.25",
    snug: "1.375",
    normal: "1.5",
    relaxed: "1.625",
    loose: "2",
  },
};

export const hostdimeShadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  DEFAULT: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
};

export const hostdimeBorders = {
  radius: {
    none: "0",
    sm: "0.125rem",   // 2px
    DEFAULT: "0.25rem", // 4px
    md: "0.375rem",   // 6px
    lg: "0.5rem",     // 8px
    xl: "0.75rem",    // 12px
    "2xl": "1rem",    // 16px
    "3xl": "1.5rem",  // 24px
    full: "9999px",
  },
  width: {
    DEFAULT: "1px",
    0: "0px",
    2: "2px",
    4: "4px",
    8: "8px",
  },
};

export const hostdimeTransitions = {
  duration: {
    DEFAULT: "150ms",
    75: "75ms",
    100: "100ms",
    150: "150ms",
    200: "200ms",
    300: "300ms",
    500: "500ms",
    700: "700ms",
    1000: "1000ms",
  },
  timing: {
    DEFAULT: "ease",
    linear: "linear",
    in: "cubic-bezier(0.4, 0, 1, 1)",
    out: "cubic-bezier(0, 0, 0.2, 1)",
    "in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

// Componentes padrão
export const hostdimeComponents = {
  // Botões
  button: {
    base: "rounded-lg font-medium transition-all",
    sizes: {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-2.5 text-base",
      xl: "px-8 py-3 text-lg",
    },
    variants: {
      primary: "bg-primary text-white hover:bg-primary-hover active:bg-primary-dark",
      secondary: "bg-neutral-800 text-white hover:bg-neutral-700 active:bg-neutral-900",
      outline: "border border-neutral-300 hover:bg-neutral-100 active:bg-neutral-200",
      ghost: "hover:bg-neutral-100 active:bg-neutral-200",
      danger: "bg-error text-white hover:bg-error-dark active:bg-error-dark",
    }
  },
  
  // Cards
  card: {
    base: "bg-card border border-border rounded-xl overflow-hidden transition-all",
    hover: "hover:border-primary/30 hover:shadow-md",
    variants: {
      elevated: "shadow-md",
      flat: "border-0 shadow-none",
      interactive: "cursor-pointer hover:-translate-y-1 hover:shadow-lg transition-all duration-300",
    }
  },
  
  // Formulários
  form: {
    input: "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
    label: "block mb-2 text-sm font-medium",
    select: "w-full rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
    checkbox: "rounded border-neutral-300 text-primary focus:ring-primary/20",
    radio: "border-neutral-300 text-primary focus:ring-primary/20",
  }
};

/**
 * Utilize essas configurações em toda a aplicação para garantir consistência visual.
 * 
 * Exemplo de uso:
 * import { hostdimeColors } from '@/styles/theme-config';
 * 
 * const MyComponent = () => (
 *   <div style={{ color: hostdimeColors.primary.DEFAULT }}>
 *     Texto na cor primária
 *   </div>
 * );
 */
