'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense } from 'react';

import { cn } from '@shared/lib/cn';
import Button from '@shared/ui/Button';
import DisplayPrice from '@shared/ui/DisplayPrice';
import DisplayTime from '@shared/ui/DisplayTime';
import HotdealBadge from '@shared/ui/HotdealBadge';
import Jirume from '@shared/ui/icons/Jirume';
import ShareButton from '@shared/ui/ShareButton';

import { ProductQueries } from '@entities/product';

import { LikeButton, RecommendButton } from '@features/product-actions';
import ViewerCount from '@features/product-detail/ui/desktop/ViewerCount';

export default function ProductInfo({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const { data: productStats } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));

  const shareTitle = `${product.title} | 지름알림`;

  return (
    <section className="flex h-full flex-col justify-between">
      <div>
        <div className="h-0.5 w-full bg-gray-600" />
        <div className="flex items-start justify-between gap-x-5 pt-6 pb-4">
          <div className="space-y-4">
            <div className="flex gap-x-2">
              {product.isEnd && (
                <div
                  className={cn('border border-gray-400 bg-white px-2 text-gray-700', {
                    'text-semibold flex h-[22px] items-center rounded-lg text-xs leading-5': true,
                  })}
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

            <h1 className="text-xl font-medium text-gray-800">{product.title}</h1>
          </div>
          <ShareButton title={shareTitle} />
        </div>
        <div className="space-y-1 pt-3 pb-8">
          <div className="h-5 text-sm text-gray-500">
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
          <div className="flex text-sm font-medium">
            <span className="inline-block w-[110px] text-gray-400">쇼핑몰</span>
            <span className="text-gray-500">{product.mallName}</span>
          </div>
          {product.author && (
            <div className="flex text-sm font-medium">
              <span className="inline-block w-[110px] text-gray-400">업로드</span>
              <span
                className={cn('flex items-center gap-1 text-gray-500', {
                  'text-primary-800': product.author.id === 'admin',
                })}
              >
                {product.author.id === 'admin' && <Jirume width={18} height={18} />}
                {product.author.nickname}
              </span>
            </div>
          )}

          <div className="flex text-sm font-medium">
            <span className="inline-block w-[110px] text-gray-400">추천수</span>
            <span className="text-gray-500">{productStats.likeCount}개</span>
          </div>
        </div>
      </div>
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
          <Button className="h-[48px] w-full px-6 text-base font-semibold">구매하러 가기</Button>
        </a>
      </div>
    </section>
  );
}
