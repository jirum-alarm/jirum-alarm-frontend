'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { cn } from '@/shared/lib/cn';
import DisplayPrice from '@/shared/ui/DisplayPrice';
import DisplayTime from '@/shared/ui/DisplayTime';
import HotdealBadge from '@/shared/ui/HotdealBadge';
import Jirume from '@/shared/ui/icons/Jirume';

import { ProductQueries } from '@/entities/product';

import { RecommendButton } from '@/features/product-actions';
import { HotDealGuideModal } from '@/features/product-detail';

export default function ProductInfo({ productId }: { productId: number }) {
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const { data: productStats } = useSuspenseQuery(ProductQueries.productStats({ id: productId }));

  return (
    <section className="px-5 pb-9">
      <div>
        <div className="flex items-center gap-3 pb-2">
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
              <HotDealGuideModal
                trigger={
                  <button aria-label="핫딜 기준 안내" title="핫딜 기준 안내">
                    <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
                  </button>
                }
              />
            </div>
          )}
        </div>
        <h1 className="font-medium text-gray-800">{product.title}</h1>
        <div className="flex flex-col gap-y-1 pt-3">
          <div className="h-5 text-sm text-gray-600">
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
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-400">쇼핑몰</span>
            <span className="text-gray-500">{product.mallName}</span>
          </div>
          {product.author && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">업로드</span>
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

          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-400">추천수</span>
            <span className="text-gray-500">{productStats.likeCount}개</span>
          </div>
        </div>
      </div>
    </section>
  );
}
