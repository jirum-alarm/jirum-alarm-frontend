/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#000000',
        error: '#EB001C',
        link: '#587DFF',
        primary: {
          50: '#F5FDEA',
          100: '#ECFCD5',
          200: '#D8FAAB',
          300: '#C5F782',
          400: '#B2F458',
          500: '#9EF22E',
          600: '#7FC125',
          700: '#5F911C',
          800: '#3F6112',
          900: '#203009',
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
      },
      animation: {
        'fade-in': 'fadeIn .3s ease-in-out',
        'fade-out': 'fadeOut .3s ease-in-out',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [require('tailwind-scrollbar-hide')],
  safelist: [
    {
      pattern: /(bg|text|border)-(primary)/,
    },
  ],
};
