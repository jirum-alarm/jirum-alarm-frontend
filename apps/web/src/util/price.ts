export function parsePrice(price?: string | null) {
  const hasWon = price?.includes('원');
  const priceWithoutWon = price
    ? price
        .replace('원', '')
        .trim()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    : '커뮤니티 확인';
  return { hasWon, priceWithoutWon };
}
