import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  // Dark is the CSS default (:root). The .light class toggles to light mode.
  // We don't use Tailwind's dark: prefix variants — all theming goes through CSS vars.
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Brand (constant across themes) ──────────────────────────────────
        primary: {
          DEFAULT: 'rgb(var(--color-primary) / <alpha-value>)',
          light: 'rgb(var(--color-primary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-primary-dark) / <alpha-value>)',
          foreground: 'rgb(var(--color-primary-fg) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--color-secondary) / <alpha-value>)',
          light: 'rgb(var(--color-secondary-light) / <alpha-value>)',
          dark: 'rgb(var(--color-secondary-dark) / <alpha-value>)',
          foreground: 'rgb(var(--color-secondary-fg) / <alpha-value>)',
        },
        accent: {
          DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
          light: 'rgb(var(--color-accent-light) / <alpha-value>)',
          dark: 'rgb(var(--color-accent-dark) / <alpha-value>)',
          foreground: 'rgb(var(--color-accent-fg) / <alpha-value>)',
        },
        success: {
          DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
          light: 'rgb(var(--color-success-light) / <alpha-value>)',
          foreground: 'rgb(var(--color-success-fg) / <alpha-value>)',
        },
        danger: {
          DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
          light: 'rgb(var(--color-danger-light) / <alpha-value>)',
          foreground: 'rgb(var(--color-danger-fg) / <alpha-value>)',
        },
        warning: {
          DEFAULT: 'rgb(var(--color-warning) / <alpha-value>)',
          light: 'rgb(var(--color-warning-light) / <alpha-value>)',
          foreground: 'rgb(var(--color-warning-fg) / <alpha-value>)',
        },

        // ── Semantic (adapt per theme) ───────────────────────────────────────
        background: {
          DEFAULT: 'rgb(var(--color-bg) / <alpha-value>)',
          secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
          border: 'rgb(var(--color-surface-border) / <alpha-value>)',
        },
        foreground: {
          DEFAULT: 'rgb(var(--color-fg) / <alpha-value>)',
          secondary: 'rgb(var(--color-fg-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-fg-muted) / <alpha-value>)',
          disabled: 'rgb(var(--color-fg-disabled) / <alpha-value>)',
        },
        muted: {
          DEFAULT: 'rgb(var(--color-muted) / <alpha-value>)',
          foreground: 'rgb(var(--color-muted-fg) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gradient-danger': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        'gradient-surface': 'linear-gradient(135deg, rgb(var(--color-surface)) 0%, rgb(var(--color-surface-elevated)) 100%)',
        'gradient-card': 'linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(139,92,246,0.05) 100%)',
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99,102,241,0.3)',
        'glow-accent': '0 0 20px rgba(16,185,129,0.3)',
        'glow-danger': '0 0 20px rgba(239,68,68,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.15)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.25)',
        'glass': '0 8px 32px rgba(0,0,0,0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-16px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}

export default config
