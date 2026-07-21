'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

import { UploaderType } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';
import { pushRecentViewedProduct } from '@/shared/lib/recentViewedProducts';
import { parsePrice } from '@/shared/lib/utils/price';
import Jirume from '@/shared/ui/common/icons/Jirume';
import DisplayPrice from '@/shared/ui/DisplayPrice';
import DisplayTime from '@/shared/ui/DisplayTime';
import HotdealBadge from '@/shared/ui/HotdealBadge';

import { ProductQueries } from '@/entities/product';
import NaverIcon from '@/entities/product/ui/NaverIcon';
import TossBadges from '@/entities/product/ui/TossBadges';
import TossIcon from '@/entities/product/ui/TossIcon';

import { RecommendButton } from '@/features/product-actions/ui';
import { useProductPurchaseStatusClarity } from '@/features/product-detail/hooks/useProductPurchaseStatusClarity';
import HotdealGuideModal from '@/features/product-detail/ui/mobile/HotDealGuideModal';

export default function ProductInfo({
  productId,
  tossData,
  naverbcData,
}: {
  productId: number;
  tossData?: import('@/entities/product/model/toss-data').TossProductData;
  naverbcData?: import('@/entities/product/model/toss-data').NaverbcProductData;
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
        <h1 className="font-medium text-gray-800">{product.title}</h1>
        <div className="flex flex-col gap-y-1 pt-3">
          <div className="h-5 text-sm text-gray-600">
            <DisplayTime time={product.postedAt} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              {tossData?.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {tossData.originalPrice.toLocaleString()}원
                </span>
              )}
              <div className="flex items-baseline gap-x-2">
                {typeof tossData?.discountRate === 'number' && (
                  <span className="text-error-500 text-2xl font-bold">
                    {tossData.discountRate}%
                  </span>
                )}
                <DisplayPrice price={product.price} />
              </div>
              {tossData && (typeof tossData.rating === 'number' || tossData.couponDiscount) && (
                <div className="flex flex-wrap items-center gap-x-2 pt-1 text-sm text-gray-500">
                  {typeof tossData.rating === 'number' && (
                    <span>
                      <span className="text-[#ffb200]">★</span> {tossData.rating}
                      {tossData.reviewCount ? ` (${tossData.reviewCount.toLocaleString()})` : ''}
                    </span>
                  )}
                  {tossData.couponDiscount ? (
                    <span className="text-error-500">
                      쿠폰 {tossData.couponDiscount.toLocaleString()}원 추가할인
                    </span>
                  ) : null}
                </div>
              )}
            </div>
            <div>
              <RecommendButton productId={productId} />
            </div>
          </div>
          {tossData && <TossBadges toss={tossData} />}
        </div>
      </div>
      <div className="pt-4">
        <div className="flex flex-col gap-[8px]">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-400">쇼핑몰</span>
            <span className="flex items-center gap-x-1 text-gray-500">
              {tossData && <TossIcon size={20} />}
              {!tossData && naverbcData && <NaverIcon height={12} />}
              {tossData ? '토스' : product.mallName}
            </span>
          </div>
          {product.uploaderType !== UploaderType.Crawled && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">업로드</span>
              <span
                className={cn('flex items-center gap-1 text-gray-600', {
                  'text-primary-800': product.uploaderType === UploaderType.Official,
                })}
              >
                {product.uploaderType === UploaderType.Official ? (
                  <>
                    <Jirume width={18} height={18} />
                    지름알림
                  </>
                ) : (
                  product.author?.nickname
                )}
              </span>
            </div>
          )}

          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-400">추천수</span>
            <span className="text-gray-500">{productStats.likeCount}개</span>
          </div>
          {tossData?.sellerName && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">판매자</span>
              <span className="text-gray-500">{tossData.sellerName}</span>
            </div>
          )}
          {tossData && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">배송비</span>
              <span className="text-gray-500">
                {tossData.deliveryFee
                  ? `${tossData.deliveryFee.toLocaleString()}원` +
                    (tossData.freeShippingThreshold
                      ? ` (${tossData.freeShippingThreshold.toLocaleString()}원 이상 무료배송)`
                      : '')
                  : '무료배송'}
              </span>
            </div>
          )}
        </div>
        {product.uploaderType === UploaderType.User && product.content && (
          <div className="mt-6">
            <h2 className="mb-2 text-sm font-medium text-gray-400">상품 설명</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
              {product.content}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
