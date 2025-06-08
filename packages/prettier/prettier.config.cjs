/** @type {import("prettier").Config} */
const config = {
  singleQuote: true,
  semi: true,
  arrowParens: 'always',
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  plugins: ['prettier-plugin-tailwindcss'],
};

module.exports = config;
