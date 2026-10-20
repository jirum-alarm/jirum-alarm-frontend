'use client';

import { promptCard } from '@jirum/design-system/recipes';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { ProductService } from '@/shared/api/product';
import { cn } from '@/shared/lib/cn';
import { pushDataLayerSoon } from '@/shared/lib/data-layer-soon';
import { getEntry } from '@/shared/lib/entry';

import { ProductQueries } from '@/entities/product';
import { peekNotificationOrigin } from '@/entities/product-list/model/notification-origin';

const SOURCE = 'coupang_search_cta';

// 새 딜은 가격이 아직 살아 있으니 «지금 얼마일까»가 아니라 쿠팡과 견줘 보라고 권한다.
const COPY = {
  aged: { title: '이 상품, 지금은 얼마일까요?', action: '가격 보기' },
  nolink: { title: '쿠팡에서도 찾아볼까요?', action: '쿠팡 보기' },
} as const;

/**
 * 딜 상세의 「쿠팡에서 지금 가격 보기」 — 오래된 딜(실험 coupang_search_cta_v1, 2026-10-13)과
 * 제휴 링크 없는 새 딜(실험 nolink_coupang_cta_v1, 2026-10-15). 문구는 서버가 주는 kind 로 고른다.
 *
 * 상세 조회 대부분이 게시 30일+ 딜에 검색으로 떨어지는데, 그 가격은 이미 끝나 구매 클릭이 거의 없다.
 * 그 사람은 이 상품을 사러 왔으니 지금 살 곳(쿠팡 검색 결과)을 준다. 서버가 실험군·대상 딜에만 링크를 돌려준다.
 * 구매 CTA 위계를 지키려고 카톡 권유 카드처럼 연한 면 + 테두리 알약으로 둔다.
 */
export default function CoupangSearchCta({
  productId,
  className,
}: {
  productId: number;
  className?: string;
}) {
  const { data: cta } = useQuery(ProductQueries.coupangSearchCta({ productId }));

  useEffect(() => {
    if (!cta) return;
    void ProductService.collectPriceContextImpression({
      productId,
      source: SOURCE,
      detail: 'coupang_search:shown',
    }).catch(() => {});
  }, [cta, productId]);

  if (!cta) return null;
  const copy = COPY[cta.kind] ?? COPY.aged;

  const handleClick = () => {
    // 이것도 구매 클릭이다 — 푸시로 들어온 상세면 nid 를 같이(BottomCTA 와 같은 귀속).
    const nid = peekNotificationOrigin(productId);
    void ProductService.collectPurchaseClick({
      productId,
      source: SOURCE,
      entry: getEntry(),
      nid,
    }).catch(() => {});
    pushDataLayerSoon({
      event: 'purchase_link_click',
      product_id: String(productId),
      click_url: cta.url,
      monetized: true,
      profit_provider: 'coupang',
      click_source: SOURCE,
      nid,
    });
  };

  return (
    <div className={className}>
      <a
        href={cta.url}
        target="_blank"
        // 제휴 아웃바운드 — 크롤러가 따라가 봇클릭을 만들지 않게 nofollow/sponsored
        rel="nofollow sponsored noopener noreferrer"
        onClick={handleClick}
        className={cn(
          'flex transition-colors hover:bg-gray-100',
          promptCard.box,
          promptCard.tone.neutral.box,
        )}
      >
        <span className="min-w-0 flex-1">
          <span className={cn('block', promptCard.title)}>{copy.title}</span>
          <span className={cn('block truncate', promptCard.description)}>
            쿠팡에서 ‘{cta.query}’ 검색 결과 보기
          </span>
        </span>
        <span
          aria-hidden
          className={cn(
            promptCard.action.box,
            promptCard.action.text,
            promptCard.tone.neutral.action.box,
            promptCard.tone.neutral.action.text,
          )}
        >
          {copy.action}
        </span>
      </a>
      <p className="text-11 mt-1.5 px-1 text-gray-500">
        쿠팡 파트너스 활동으로 지름알림이 일정 수수료를 받아요.
      </p>
    </div>
  );
}
