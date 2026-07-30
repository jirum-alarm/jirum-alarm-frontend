const VIEWED_PRODUCT_IDS_KEY = 'gr-viewed-product-ids';
// 목록 몇 페이지를 넘겨도 "본 건 흐리게"가 유지될 만큼. localStorage 5MB 대비 무해.
const VIEWED_PRODUCT_IDS_LIMIT = 500;

/**
 * id 를 문자열로 통일한다. 카드(ProductCardType.id)는 string, 상세 진입 경로는
 * number 를 넘기는데 둘이 같은 상품을 가리키므로 저장 시점에 맞춰준다.
 * (숫자로 통일하면 카드마다 Number() 변환이 필요하고 비숫자 id 에서 깨진다.)
 */
export function getViewedProductIds(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(VIEWED_PRODUCT_IDS_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function pushViewedProductId(productId: string | number) {
  try {
    const id = String(productId);
    const prev = getViewedProductIds().filter((prevId) => prevId !== id);
    localStorage.setItem(
      VIEWED_PRODUCT_IDS_KEY,
      JSON.stringify([id, ...prev].slice(0, VIEWED_PRODUCT_IDS_LIMIT)),
    );
  } catch {
    // ignore localStorage errors (private mode, quota, etc.)
  }
}
