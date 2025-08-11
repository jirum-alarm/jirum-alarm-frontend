export function parsePrice(price?: string | null) {
  const hasWon = price?.includes('원');
  const priceWithoutWon = price ? price.replace('원', '').trim() : null;
  return { hasWon, priceWithoutWon };
}
