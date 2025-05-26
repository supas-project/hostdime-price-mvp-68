
import { type Config } from "tailwindcss";
import { colors, typography, spacing, breakpoints, shadows, borderRadius, transitions, zIndex, touchTargets } from "./src/styles/design-tokens";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        sm: "1.5rem",
        lg: "2rem"
      },
      screens: breakpoints
    },
    extend: {
      // Design tokens integrados
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          hover: "hsl(var(--primary-hover))",
          foreground: "hsl(var(--primary-foreground))",
          ...colors.primary
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        // Tokens HostDime
        neutral: colors.neutral,
        semantic: colors.semantic,
      },
      
      // Tipografia
      fontSize: typography.fontSize,
      fontWeight: typography.fontWeight,
      lineHeight: typography.lineHeight,
      
      // Espaçamento
      spacing: {
        ...spacing,
        // Touch targets para acessibilidade
        'touch-sm': touchTargets.sm,
        'touch-md': touchTargets.md,
        'touch-lg': touchTargets.lg,
        'touch-xl': touchTargets.xl,
      },
      
      // Breakpoints
      screens: breakpoints,
      
      // Sombras
      boxShadow: shadows,
      
      // Bordas
      borderRadius: borderRadius,
      
      // Z-index
      zIndex: zIndex,
      
      // Transições
      transitionDuration: transitions.duration,
      transitionTimingFunction: transitions.timing,
      
      // Keyframes para micro-interações
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" }
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" }
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "fade-out": {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(8px)" }
        },
        "slide-in-right": {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" }
        },
        "slide-out-right": {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(100%)" }
        },
        "scale-in": {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        "bounce": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" }
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-4px)" },
          "75%": { transform: "translateX(4px)" }
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.02)" }
        }
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in-right": "slide-in-right 0.3s ease-out",
        "slide-out-right": "slide-out-right 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce": "bounce 0.3s ease-in-out",
        "shake": "shake 0.4s ease-in-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite"
      },
      
      // Utilitários para acessibilidade
      aria: {
        'current-page': 'page',
        'current-step': 'step',
      }
    }
  },
  plugins: [
    require("tailwindcss-animate"),
    require('tailwind-scrollbar')({ nocompatible: true }),
    // Plugin customizado para acessibilidade
    function({ addUtilities }) {
      addUtilities({
        '.sr-only': {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
        '.focus-ring': {
          '&:focus-visible': {
            outline: '2px solid hsl(var(--primary))',
            outlineOffset: '2px',
          }
        },
        '.touch-target': {
          minHeight: touchTargets.md,
          minWidth: touchTargets.md,
        },
        '.motion-reduce': {
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none',
            transition: 'none',
          }
        }
      });
    }
  ]
} satisfies Config;
