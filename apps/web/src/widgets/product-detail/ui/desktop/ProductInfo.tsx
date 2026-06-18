'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';

import { cn } from '@/shared/lib/cn';
import { pushRecentViewedProduct } from '@/shared/lib/recentViewedProducts';
import Button from '@/shared/ui/common/Button';
import Jirume from '@/shared/ui/common/icons/Jirume';
import DisplayPrice from '@/shared/ui/DisplayPrice';
import DisplayTime from '@/shared/ui/DisplayTime';
import HotdealBadge from '@/shared/ui/HotdealBadge';
import ShareButton from '@/shared/ui/ShareButton';

import { ProductQueries } from '@/entities/product';

import { LikeButton, RecommendButton } from '@/features/product-actions/ui';
import { useProductPurchaseStatusClarity } from '@/features/product-detail/hooks/useProductPurchaseStatusClarity';
import ViewerCount from '@/features/product-detail/ui/desktop/ViewerCount';

export default function ProductInfo({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
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

  const shareTitle = `${product.title} | 지름알림`;

  return (
    <section className="flex h-full flex-col justify-between">
      <div>
        <div className="bg-surface-inverse-muted h-0.5 w-full" />
        <div className="flex items-start justify-between gap-x-5 pt-6 pb-4">
          <div className="space-y-4">
            <div className="flex gap-x-2">
              {product.isEnd && (
                <div
                  className={cn(
                    'bg-surface-default text-fg-secondary-strong border-border-interactive border px-2',
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
                  {/* TODO: 핫딜 기준 안내 모달 추가 */}
                  <button aria-label="핫딜 기준 안내" title="핫딜 기준 안내">
                    <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
                  </button>
                </div>
              )}
            </div>

            <h1 className="typography-headline-20m text-fg-strong">{product.title}</h1>
          </div>
          <ShareButton title={shareTitle} />
        </div>
        <div className="space-y-1 pt-3 pb-8">
          <div className="text-fg-secondary typography-body-14r h-5">
            <DisplayTime time={product.postedAt} />
          </div>
          <div className="flex justify-between">
            <DisplayPrice price={product.price} />

            <div>
              <RecommendButton productId={productId} />
            </div>
          </div>
        </div>
        {product.viewCount >= 10 && <ViewerCount count={product.viewCount} />}
        <div className="my-6 space-y-2">
          <div className="typography-body-14m flex">
            <span className="text-fg-tertiary inline-block w-[110px]">쇼핑몰</span>
            <span className="text-fg-secondary">{product.mallName}</span>
          </div>
          {product.author && (
            <div className="typography-body-14m flex">
              <span className="text-fg-tertiary inline-block w-[110px]">업로드</span>
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

          <div className="typography-body-14m flex">
            <span className="text-fg-tertiary inline-block w-[110px]">추천수</span>
            <span className="text-fg-secondary">{productStats.likeCount}개</span>
          </div>
        </div>
      </div>
      <div>
        <div className="flex w-full gap-x-4">
          <div className="flex h-[48px] items-center">
            <Suspense>
              <LikeButton productId={productId} isUserLogin={isUserLogin} />
            </Suspense>
          </div>
          <a
            href={product.detailUrl ?? ''}
            className="block flex-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="typography-title-16sb h-[48px] w-full px-6">구매하러 가기</Button>
          </a>
        </div>
      </div>
    </section>
  );
}
