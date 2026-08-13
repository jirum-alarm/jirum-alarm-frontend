import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';
import {StorageKey} from '@/shared/constant/storage-key';

export type RecentViewedProduct = {
  id: number;
  title: string;
  thumbnail: string | null;
  price: string | null;
};

/** 네이티브 쪽 상한. 웹뷰 홈/커뮤니티 태그는 WEB_LIMIT 만 본다. */
const MAX = 20;

/** web `recentViewedProducts.ts` 와 같은 키·상한. 커뮤니티 상품 태그가 이걸 읽는다. */
export const WEB_RECENT_VIEWED_KEY = 'gr-recent-viewed-products';
export const WEB_RECENT_VIEWED_LIMIT = 5;

/**
 * 최근 본 상품.
 *
 * web 은 상세에서 localStorage 에 쌓는데, 상단이 네이티브로 바뀌면 그 기록이
 * 끊겨 웹뷰 홈의 "최근 본 상품"이 빈다. 네이티브가 대신 쌓아 둔다.
 *
 * ponytail: AsyncStorage 에 JSON 배열 한 덩어리. 20건짜리라 인덱싱 불필요 —
 * 목록이 커지면 그때 나눈다.
 */
export async function pushRecentViewedProduct(product: RecentViewedProduct) {
  try {
    const list = await getRecentViewedProducts();
    // 같은 상품을 다시 보면 맨 앞으로 끌어올린다.
    const deduped = list.filter(p => p.id !== product.id);
    deduped.unshift(product);
    await setAsyncStorage(
      StorageKey.RECENT_VIEWED_PRODUCTS,
      JSON.stringify(deduped.slice(0, MAX)),
    );
  } catch {
    // 기록 실패가 상세 화면을 막지 않는다.
  }
}

export async function getRecentViewedProducts(): Promise<
  RecentViewedProduct[]
> {
  try {
    const raw = await getAsyncStorage(StorageKey.RECENT_VIEWED_PRODUCTS);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // 저장 포맷이 바뀌었거나 손상돼도 화면이 죽지 않도록 배열인지 확인한다.
    return Array.isArray(parsed) ? (parsed as RecentViewedProduct[]) : [];
  } catch {
    return [];
  }
}

/**
 * 웹뷰 localStorage 에 최근 본 상품을 심는 스크립트.
 *
 * 네이티브 상세는 AsyncStorage 에만 쌓이므로, 그대로 두면 웹뷰 커뮤니티의
 * "최근 본 상품" 태그 모달이 빈다. 웹이 읽는 키·상한(5건)으로 맞춰 주입한다.
 */
export function buildRecentViewedInjectScript(
  products: RecentViewedProduct[],
): string {
  const payload = JSON.stringify(products.slice(0, WEB_RECENT_VIEWED_LIMIT));
  return `
    (function() {
      try {
        localStorage.setItem(
          ${JSON.stringify(WEB_RECENT_VIEWED_KEY)},
          ${JSON.stringify(payload)}
        );
      } catch (e) {}
    })();
    true;
  `;
}
