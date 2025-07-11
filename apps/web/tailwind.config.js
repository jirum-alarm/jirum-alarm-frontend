/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      backgroundImage: {
        'fade-to-white':
          'linear-gradient(to right, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%)',
      },
      fontFamily: {
        sans: ['var(--font-pretendard)'],
      },
      fontSize: {
        s: ['0.8125rem', { lineHeight: '1rem' }], // 13px
        lg: [
          '1.125rem',
          {
            lineHeight: '2rem',
          },
        ],
      },
      spacing: {
        22: '5.5rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-bottom-16': 'calc(16px + env(safe-area-inset-bottom))',
        'safe-bottom-96': 'calc(96px + env(safe-area-inset-bottom))',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        'slider-max': 'calc(100% - 128px)',
      },
      screens: {
        txs: '320px',
        xs: '375px',
        smd: '550px',
        '3xl': '1440px',
        'layout-max': '1280px',
        'mobile-max': '600px',
        'mouse-hover': { raw: '(hover: hover)' },
      },
      colors: {
        white: '#FFFFFF',
        black: '#000000',
        error: {
          50: '#FFE1E5',
          100: '#FBCCD2',
          200: '#F799A4',
          300: '#F36677',
          400: '#EF334A',
          500: '#EB001C',
          600: '#BC0017',
          700: '#8D0011',
          800: '#5E000B',
          900: '#2F0006',
        },
        link: '#587DFF',
        primary: {
          50: '#F5FDEA',
          100: '#ECFCD5',
          200: '#D8FAAB',
          300: '#C5F782',
          400: '#B2F458',
          500: '#9EF22E',
          600: '#4AD11B',
          700: '#039100',
          800: '#025900',
          900: '#013200',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F2F4F7',
          200: '#E4E7EC',
          300: '#D0D5DD',
          400: '#98A2B3',
          500: '#667085',
          600: '#475467',
          700: '#344054',
          800: '#1D2939',
          900: '#101828',
        },
        secondary: {
          50: '#F3F7FF',
          100: '#DAE5FE',
          200: '#B5CBFD',
          300: '#91B1FB',
          400: '#6593FD',
          500: '#467DFB',
          600: '#3964C7',
          700: '#2B4B95',
          800: '#1C3264',
          900: '#0E1932',
        },
      },
      boxShadow: {
        small: '0px 2px 12px 0px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        fadeOut: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 },
        },
        modalZoomIn: {
          '0%': {
            transform: 'translateY(-50%) translateX(-50%) scale(0.75)',
            opacity: 0,
          },
          '100%': {
            transform: 'translateY(-50%) translateX(-50%) scale(1)',
            opacity: 1,
          },
        },
        modalZoomOut: {
          '0%': {
            transform: 'translateY(-50%) translateX(-50%) scale(1)',
            opacity: 1,
          },
          '100%': {
            transform: 'translateY(-50%) translateX(-50%) scale(0.75)',
            opacity: 0,
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn .2s ease-in-out',
        'fade-out': 'fadeOut .2s ease-in-out',
        'modal-zoom-in': 'modalZoomIn .15s ease-in-out',
        'modal-zoom-out': 'modalZoomOut .15s ease-in-out',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
    function ({ addVariant }) {
      addVariant('pc', '.pc &');
    },
  ],
  safelist: [
    {
      pattern: /(bg|text|border)-(primary)/,
    },
  ],
};
