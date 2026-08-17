'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';

import { UploaderType } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';
import { pushRecentViewedProduct } from '@/shared/lib/recentViewedProducts';
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
import type { ProductPriceVerdict } from '@/features/product-detail/lib/price-verdict';
import HotdealGuideModal from '@/features/product-detail/ui/mobile/HotDealGuideModal';
import PriceVerdictHero from '@/features/product-detail/ui/PriceVerdictHero';
import ProductGuideMetaRows, {
  type GuideRow as ProductGuideRow,
} from '@/features/product-detail/ui/ProductGuideMetaRows';

export default function ProductInfo({
  productId,
  tossData,
  naverbcData,
  ohouData,
  initialGuides,
  initialVerdict,
}: {
  productId: number;
  tossData?: import('@/entities/product/model/toss-data').TossProductData;
  naverbcData?: import('@/entities/product/model/toss-data').NaverbcProductData;
  ohouData?: import('@/entities/product/model/toss-data').OhouProductData;
  initialGuides?: ProductGuideRow[] | null;
  initialVerdict?: ProductPriceVerdict | null;
}) {
  // 가격/할인율/평점/쿠폰 UI는 소스 무관 공통 필드라 토스·오늘의집이 같은 블록을 공유한다.
  const displayData = tossData ?? ohouData;
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));

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
              {displayData?.originalPrice && (
                <span className="text-sm text-gray-400 line-through">
                  {displayData.originalPrice.toLocaleString()}원
                </span>
              )}
              <div className="flex items-baseline gap-x-2">
                {typeof displayData?.discountRate === 'number' && (
                  <span className="text-error-500 text-2xl font-bold">
                    {displayData.discountRate}%
                  </span>
                )}
                <DisplayPrice price={product.price} />
              </div>
              {displayData &&
                (typeof displayData.rating === 'number' || displayData.couponDiscount) && (
                  <div className="flex flex-wrap items-center gap-x-2 pt-1 text-sm text-gray-500">
                    {typeof displayData.rating === 'number' && (
                      <span>
                        <span className="text-[#ffb200]">★</span> {displayData.rating}
                        {displayData.reviewCount
                          ? ` (${displayData.reviewCount.toLocaleString()})`
                          : ''}
                      </span>
                    )}
                    {displayData.couponDiscount ? (
                      <span className="text-error-500">
                        쿠폰{' '}
                        {typeof displayData.couponDiscount === 'number'
                          ? `${displayData.couponDiscount.toLocaleString()}원 추가할인`
                          : displayData.couponDiscount}
                      </span>
                    ) : null}
                  </div>
                )}
            </div>
            <div>
              <RecommendButton productId={productId} />
            </div>
          </div>
          <PriceVerdictHero productId={productId} verdict={initialVerdict} />
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
              {tossData ? '토스' : ohouData ? '오늘의집' : product.mallName}
            </span>
          </div>
          {/* 서버가 가이드를 넘겨줬으면 Suspense 없이 첫 렌더에 그린다(깜빡임·CLS 제거).
              못 받았을 때만 기존 쿼리 경로로 폴백. */}
          {initialGuides ? (
            <ProductGuideMetaRows
              productId={productId}
              variant="mobile"
              initialGuides={initialGuides}
            />
          ) : (
            <Suspense fallback={null}>
              <ProductGuideMetaRows productId={productId} variant="mobile" />
            </Suspense>
          )}
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

          {displayData?.sellerName && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">판매자</span>
              <span className="text-gray-500">{displayData.sellerName}</span>
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
          {!tossData && ohouData?.delivery && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">배송비</span>
              <span className="text-gray-500">{ohouData.delivery}</span>
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
