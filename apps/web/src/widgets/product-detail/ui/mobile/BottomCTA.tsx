'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';

import Button from '@/shared/ui/common/Button';
import TopButton from '@/shared/ui/TopButton';

import { ProductQueries } from '@/entities/product';

import { LikeButton } from '@/features/product-actions/ui';
import {
  buildPostPurchasePromptQueue,
  type PostPurchasePromptKind,
} from '@/features/product-detail/lib/okachat';
import PostPurchaseKakaoPrompt from '@/features/product-detail/ui/PostPurchaseKakaoPrompt';
import PostPurchaseKeywordPrompt from '@/features/product-detail/ui/PostPurchaseKeywordPrompt';

export default function BottomCTA({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const [promptQueue, setPromptQueue] = useState<PostPurchasePromptKind[]>([]);

  const phase = promptQueue[0] ?? null;
  const advancePrompt = () => setPromptQueue((q) => q.slice(1));

  // GTM Click URL 변수는 클릭된 안쪽 <button>(href 없음)을 읽어 click_url 이 99.7% 빈값이었다.
  // href·수익화 여부를 dataLayer 로 명시 전송 — GTM 태그를 customEvent 트리거로 전환해야 반영됨 (2026-07-20).
  const handlePurchaseClick = () => {
    // 구매 링크는 target=_blank 라 유저는 이 페이지에 남는다. 그 순간에만 알림/오카방을 권한다.
    setPromptQueue(buildPostPurchasePromptQueue(isUserLogin));

    if (typeof window === 'undefined') return;
    (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
      event: 'purchase_link_click',
      product_id: String(productId),
      click_url: product?.detailUrl ?? '',
      monetized: product?.isProfitUrl ?? false,
      profit_provider: product?.profitLinkProvider ?? null,
    });
  };

  return (
    <div className="max-w-mobile-max pb-safe-bottom fixed bottom-0 left-1/2 z-50 mx-auto w-full -translate-x-1/2 border-t border-t-[#D0D5DD] bg-white">
      <PostPurchaseKakaoPrompt
        show={phase === 'kakao'}
        onClose={advancePrompt}
        className="border-b border-gray-100 px-5"
      />
      <PostPurchaseKeywordPrompt
        show={phase === 'keyword'}
        title={product?.title ?? ''}
        onClose={advancePrompt}
        className="border-b border-gray-100 px-5"
      />
      <div className="flex w-full items-center gap-x-4 px-5 py-2">
        <TopButton />
        <div className="flex h-[48px] items-center">
          <LikeButton productId={productId} isUserLogin={isUserLogin} />
        </div>
        <a
          href={product?.detailUrl ?? ''}
          onClick={handlePurchaseClick}
          className="block flex-1"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="h-[48px] w-full px-6 text-base font-semibold">구매하러 가기</Button>
        </a>
      </div>
    </div>
  );
}
