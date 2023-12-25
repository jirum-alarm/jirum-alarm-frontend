/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
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
      },
    },
    minHeight: {
      0: '0',
      '1/4': '25%',
      '1/2': '50%',
      '3/4': '75%',
      full: '100%',
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
}
