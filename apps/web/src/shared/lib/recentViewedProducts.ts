export type RecentViewedProduct = {
  id: number;
  title: string;
  thumbnail?: string | null;
  price?: string | null;
};

const RECENT_VIEWED_PRODUCTS_KEY = 'gr-recent-viewed-products';
const RECENT_VIEWED_PRODUCTS_LIMIT = 5;

export function getRecentViewedProducts(): RecentViewedProduct[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_VIEWED_PRODUCTS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function pushRecentViewedProduct(product: RecentViewedProduct) {
  try {
    const prev = getRecentViewedProducts().filter((p) => p.id !== product.id);
    localStorage.setItem(
      RECENT_VIEWED_PRODUCTS_KEY,
      JSON.stringify([product, ...prev].slice(0, RECENT_VIEWED_PRODUCTS_LIMIT)),
    );
  } catch {
    // ignore localStorage errors (private mode, quota, etc.)
  }
}
