'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { cn } from '@/shared/lib/cn';
import { pushRecentViewedProduct } from '@/shared/lib/recentViewedProducts';
import { parsePrice } from '@/shared/lib/utils/price';
import Jirume from '@/shared/ui/common/icons/Jirume';
import DisplayPrice from '@/shared/ui/DisplayPrice';
import DisplayTime from '@/shared/ui/DisplayTime';
import HotdealBadge from '@/shared/ui/HotdealBadge';

import { ProductQueries } from '@/entities/product';

import { RecommendButton } from '@/features/product-actions/ui';
import { useProductPurchaseStatusClarity } from '@/features/product-detail/hooks/useProductPurchaseStatusClarity';
import HotdealGuideModal from '@/features/product-detail/ui/mobile/HotDealGuideModal';

export default function ProductInfo({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const { data: productStats } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));

  useEffect(() => {
    pushRecentViewedProduct({
      id: Number(product.id),
      title: product.title,
      thumbnail: product.thumbnail ?? null,
      price: product.price ?? null,
    });
  }, [product.id, product.price, product.thumbnail, product.title]);

  useProductPurchaseStatusClarity({
    productId: product.id,
    isEnd: product.isEnd,
  });

  return (
    <section className="px-5 pb-9">
      <div>
        <div className="flex items-center gap-3 pb-2">
          {product.isEnd && (
            <div
              className={cn(
                'bg-surface-default text-fg-secondary-strong border border-gray-400 px-2',
                {
                  'text-semibold flex h-[22px] items-center rounded-lg text-xs leading-5': true,
                },
              )}
            >
              판매종료
            </div>
          )}
          {!product.isEnd && product.hotDealType && (
            <div className="flex items-center gap-[8px]">
              <HotdealGuideModal
                trigger={
                  <button aria-label="핫딜 기준 안내" title="핫딜 기준 안내">
                    <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
                  </button>
                }
              />
            </div>
          )}
        </div>
        <h1 className="text-fg-strong font-medium">{product.title}</h1>
        <div className="flex flex-col gap-y-1 pt-3">
          <div className="text-fg-muted h-5 text-sm">
            <DisplayTime time={product.postedAt} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <DisplayPrice price={product.price} />
            </div>
            <div>
              <RecommendButton productId={productId} />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <div className="flex flex-col gap-[8px]">
          <div className="typography-body-14m flex justify-between">
            <span className="text-fg-tertiary">쇼핑몰</span>
            <span className="text-fg-secondary">{product.mallName}</span>
          </div>
          {product.author && (
            <div className="typography-body-14m flex justify-between">
              <span className="text-fg-tertiary">업로드</span>
              <span
                className={cn('text-fg-secondary flex items-center gap-1', {
                  'text-primary-800': product.author.id === 'admin',
                })}
              >
                {product.author.id === 'admin' && <Jirume width={18} height={18} />}
                {product.author.nickname}
              </span>
            </div>
          )}

          <div className="typography-body-14m flex justify-between">
            <span className="text-fg-tertiary">추천수</span>
            <span className="text-fg-secondary">{productStats.likeCount}개</span>
          </div>
        </div>
      </div>
    </section>
  );
}
