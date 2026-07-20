'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import Button from '@/shared/ui/common/Button';
import TopButton from '@/shared/ui/TopButton';

import { ProductQueries } from '@/entities/product';

import { LikeButton } from '@/features/product-actions/ui';

export default function BottomCTA({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

  // GTM Click URL 변수는 클릭된 안쪽 <button>(href 없음)을 읽어 click_url 이 99.7% 빈값이었다.
  // href·수익화 여부를 dataLayer 로 명시 전송 — GTM 태그를 customEvent 트리거로 전환해야 반영됨 (2026-07-20).
  const handlePurchaseClick = () => {
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
