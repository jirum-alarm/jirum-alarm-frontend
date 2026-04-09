type PriceValue = string | number | null | undefined;

const NUMERIC_PRICE_PATTERN = /^\d[\d,\s]*$/;

export function parsePrice(price?: PriceValue) {
  if (price === null || price === undefined || price === '') {
    return { hasWon: false, priceWithoutWon: '커뮤니티 확인' };
  }

  if (typeof price === 'number') {
    return {
      hasWon: true,
      priceWithoutWon: price.toLocaleString(),
    };
  }

  const normalizedPrice = price.replace('원', '').trim();
  const hasWon = price.includes('원') || NUMERIC_PRICE_PATTERN.test(normalizedPrice);
  const numericPrice = normalizedPrice.replaceAll(',', '').replaceAll(' ', '');

  const priceWithoutWon =
    hasWon && numericPrice !== '' && Number.isFinite(Number(numericPrice))
      ? Number(numericPrice).toLocaleString()
      : normalizedPrice;

  return { hasWon, priceWithoutWon };
}
