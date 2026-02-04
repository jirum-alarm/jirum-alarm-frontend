const currentYear = new Date().getFullYear();
const yearRange = 100;
export const BIRTH_YEAR = Array.from({ length: yearRange }, (_, index) => currentYear - index);
