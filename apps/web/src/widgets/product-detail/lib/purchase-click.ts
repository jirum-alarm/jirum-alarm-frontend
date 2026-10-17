import { ProductService } from '@/shared/api/product';
import { pushDataLayerSoon } from '@/shared/lib/data-layer-soon';
import { getEntry } from '@/shared/lib/entry';

import { peekNotificationOrigin } from '@/entities/product-list/model/notification-origin';

type PurchaseLinkProduct = {
  detailUrl?: string | null;
  isProfitUrl?: boolean | null;
  profitLinkProvider?: string | null;
};

// 구매 링크 클릭 기록 — 서버(collectPurchaseClick)와 GA4(dataLayer purchase_link_click) 두 곳.
// GTM Click URL 변수는 클릭된 안쪽 <button>(href 없음)을 읽어 click_url 이 99.7% 빈값이었다.
// href·수익화 여부를 dataLayer 로 명시 전송 — GTM 태그를 customEvent 트리거로 전환해야 반영됨 (2026-07-20).
export const recordPurchaseClick = ({
  productId,
  product,
  source,
}: {
  productId: number;
  product?: PurchaseLinkProduct | null;
  source: string;
}) => {
  // 푸시로 들어온 상세면 그 발송 nid 를 서버·GA4 양쪽에 — 알림 → 구매 귀속(notification-origin).
  const nid = peekNotificationOrigin(productId);
  // fire-and-forget — 새 탭으로 나가도 이 페이지에 남아 요청이 끝난다.
  void ProductService.collectPurchaseClick({
    productId,
    source,
    entry: getEntry(),
    nid,
  }).catch(() => {});

  // GTM 태그가 동기로 돌아 새 창이 늦게 뜬다 — 클릭 처리 뒤로 미룬다(data-layer-soon.ts).
  pushDataLayerSoon({
    event: 'purchase_link_click',
    product_id: String(productId),
    click_url: product?.detailUrl ?? '',
    monetized: product?.isProfitUrl ?? false,
    profit_provider: product?.profitLinkProvider ?? null,
    nid,
    cta_source: source,
  });
};
