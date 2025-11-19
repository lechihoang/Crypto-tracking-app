/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CoinMarketCap-inspired Dark Theme using CSS variables
        background: 'var(--background)',
        'background-elevated': 'var(--background-elevated)',
        'background-card': 'var(--background-card)',
        'background-hover': 'var(--background-hover)',
        foreground: 'var(--foreground)',
        'foreground-secondary': 'var(--foreground-secondary)',
        'foreground-tertiary': 'var(--foreground-tertiary)',
        
        primary: {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)', // #3861FB
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
          DEFAULT: 'var(--primary-blue)',
        },
        success: {
          50: 'var(--color-success-50)',
          100: 'var(--color-success-100)',
          200: 'var(--color-success-200)',
          300: 'var(--color-success-300)',
          400: 'var(--color-success-400)',
          500: 'var(--color-success-500)', // #16C784
          600: 'var(--color-success-600)',
          700: 'var(--color-success-700)',
          800: 'var(--color-success-800)',
          900: 'var(--color-success-900)',
          DEFAULT: 'var(--success-green)',
        },
        danger: {
          50: 'var(--color-danger-50)',
          100: 'var(--color-danger-100)',
          200: 'var(--color-danger-200)',
          300: 'var(--color-danger-300)',
          400: 'var(--color-danger-400)',
          500: 'var(--color-danger-500)', // #EA3943
          600: 'var(--color-danger-600)',
          700: 'var(--color-danger-700)',
          800: 'var(--color-danger-800)',
          900: 'var(--color-danger-900)',
          DEFAULT: 'var(--danger-red)',
        },
        warning: {
          50: 'var(--color-warning-50)',
          100: 'var(--color-warning-100)',
          200: 'var(--color-warning-200)',
          300: 'var(--color-warning-300)',
          400: 'var(--color-warning-400)',
          500: 'var(--color-warning-500)',
          600: 'var(--color-warning-600)',
          700: 'var(--color-warning-700)',
          800: 'var(--color-warning-800)',
          900: 'var(--color-warning-900)',
        },
        gray: {
          50: 'var(--color-gray-50)',   // #F8F9FA - Primary text
          100: 'var(--color-gray-100)', // #B0B3BB - Secondary text
          200: 'var(--color-gray-200)', // #9295A3 - Tertiary text
          300: 'var(--color-gray-300)', // #6B7280 - Placeholder text
          400: 'var(--color-gray-400)',
          500: 'var(--color-gray-500)',
          600: 'var(--color-gray-600)', // #2B2F36 - Border
          700: 'var(--color-gray-700)', // #23242a - Hover
          800: 'var(--color-gray-800)', // #1E2026 - Card
          900: 'var(--color-gray-900)', // #17171A - Background
          950: 'var(--color-gray-950)',
        },
        dark: {
          50: 'var(--color-dark-50)',
          100: 'var(--color-dark-100)',
          200: 'var(--color-dark-200)',
          300: 'var(--color-dark-300)',
          400: 'var(--color-dark-400)',
          500: 'var(--color-dark-500)', // #2B2F36
          600: 'var(--color-dark-600)', // #23242a
          700: 'var(--color-dark-700)', // #1E2026
          800: 'var(--color-dark-800)',
          900: 'var(--color-dark-900)', // #17171A
        },
        border: {
          primary: 'var(--border-primary)',
          subtle: 'var(--border-subtle)',
        },
      },
      backgroundImage: {
        // Removed gradient backgrounds for CoinMarketCap style
      },
      boxShadow: {
        // Removed glow shadows for CoinMarketCap style
        'card': '0 2px 8px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 12px rgba(0, 0, 0, 0.4)',
      },
      borderRadius: {
        'sm': '0.375rem',  // 6px
        'md': '0.5rem',    // 8px
        'lg': '0.75rem',   // 12px
        'xl': '1rem',      // 16px
      },
      transitionDuration: {
        '200': '200ms',
        '300': '300ms',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}