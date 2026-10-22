'use client';

import { detailInfo, text } from '@jirum/design-system/recipes';
import { END_BADGE_EXPLAIN } from '@jirum/domain/badge-explain';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';

import { UploaderType } from '@/shared/api/gql/graphql';
import type { ProductDealEvidence } from '@/shared/api/product/product.service';
import { cn } from '@/shared/lib/cn';
import { pushRecentViewedProduct } from '@/shared/lib/recentViewedProducts';
import Badge from '@/shared/ui/common/Badge';
import Jirume from '@/shared/ui/common/icons/Jirume';
import DisplayPrice from '@/shared/ui/DisplayPrice';
import DisplayTime from '@/shared/ui/DisplayTime';

import { ProductQueries } from '@/entities/product';
import { stripPriceFromTitle } from '@/entities/product/lib/from-toss';
import ExplainedBadge from '@/entities/product/ui/ExplainedBadge';
import NaverIcon from '@/entities/product/ui/NaverIcon';
import TossBadges from '@/entities/product/ui/TossBadges';
import TossIcon from '@/entities/product/ui/TossIcon';
import TimeDealDetailTimer from '@/entities/promotion/ui/TimeDealDetailTimer';

import { RecommendButton } from '@/features/product-actions/ui';
import { useProductPurchaseStatusClarity } from '@/features/product-detail/hooks/useProductPurchaseStatusClarity';
import { formatDeliveryText } from '@/features/product-detail/lib/delivery-text';
import { dealFreshnessAt, isSeenBasedFreshness } from '@/features/product-detail/lib/product-seo';
import DealEvidenceBlock from '@/features/product-detail/ui/DealEvidenceBlock';
import HotdealCriteriaBadge from '@/features/product-detail/ui/HotdealCriteriaBadge';
import ProductGuideMetaRows, {
  DetailInfoRow,
  type GuideRow as ProductGuideRow,
} from '@/features/product-detail/ui/ProductGuideMetaRows';

import InlineBuyFallback from './InlineBuyFallback';

export default function ProductInfo({
  productId,
  tossData,
  naverbcData,
  ohouData,
  initialGuides,
  initialEvidence,
  hidePrice,
}: {
  productId: number;
  tossData?: import('@/entities/product/model/toss-data').TossProductData;
  naverbcData?: import('@/entities/product/model/toss-data').NaverbcProductData;
  ohouData?: import('@/entities/product/model/toss-data').OhouProductData;
  initialGuides?: ProductGuideRow[] | null;
  /** 왜 핫딜인지 — 근거 블록·가격 조건 줄·정보 표에서 뺄 행(서버 dealEvidence) */
  initialEvidence?: ProductDealEvidence | null;
  /** 토스 특가 코너에서 들어온 경우 판매가를 숨긴다. */
  hidePrice?: boolean;
}) {
  // 가격/할인율/평점/쿠폰 UI는 소스 무관 공통 필드라 토스·오늘의집이 같은 블록을 공유한다.
  const displayData = tossData ?? ohouData;
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const displayTitle = hidePrice ? stripPriceFromTitle(product.title) : product.title;

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

  const deliveryText = formatDeliveryText(tossData, ohouData);

  return (
    <section className="px-5 pb-6">
      <div>
        {/* 게시 시각은 배지 줄 오른쪽에 — 가격 위에 줄을 하나 더 두면 375×667 첫 화면에서 가격이 밀려난다. */}
        <div className="flex items-center gap-3 pb-2">
          {product.isEnd && (
            <ExplainedBadge lines={END_BADGE_EXPLAIN}>
              <Badge size="tag" variant="outline" tone="gray">
                판매종료
              </Badge>
            </ExplainedBadge>
          )}
          {/* 배지 뜻 한 줄 + 누르면 기준 시트. 이 딜의 구체적 근거는 가격 아래 근거 블록이 말한다. */}
          {!product.isEnd && product.hotDealType && (
            <HotdealCriteriaBadge hotdealType={product.hotDealType} />
          )}
          <div className="ml-auto shrink-0 text-sm text-gray-600">
            <DisplayTime time={dealFreshnessAt(product) ?? product.postedAt} />
            {isSeenBasedFreshness(product) && ' 확인'}
          </div>
        </div>
        <h1 className="font-medium text-gray-800">{displayTitle}</h1>
        <div className="flex flex-col gap-y-1 pt-3">
          <div className="flex items-center justify-between">
            <div>
              {hidePrice ? (
                <p className={text.title}>토스에서 가격 확인</p>
              ) : (
                <>
                  {displayData?.originalPrice && (
                    <span className={cn(text.muted, 'line-through')}>
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
                </>
              )}
              {displayData &&
                (typeof displayData.rating === 'number' ||
                  (!hidePrice && displayData.couponDiscount)) && (
                  <div className={cn(text.muted, 'flex flex-wrap items-center gap-x-2 pt-1')}>
                    {typeof displayData.rating === 'number' && (
                      <span>
                        <span className="text-warning-400">★</span> {displayData.rating}
                        {displayData.reviewCount
                          ? ` (${displayData.reviewCount.toLocaleString()})`
                          : ''}
                      </span>
                    )}
                    {!hidePrice && displayData.couponDiscount ? (
                      <span className="text-error-600">
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
          {/* 선착순·타임특가면 가격 바로 아래 종료/오픈 타이머(무신사 상세처럼 가격 곁에) */}
          <TimeDealDetailTimer product={product} />
          {!hidePrice && (
            <>
              {/* 가격은 조건과 붙어 있어야 뜻이 선다 — 페이코 27.5% 할인가·배송비 2,500원 별도 */}
              {initialEvidence?.condition ? (
                <p className="truncate text-sm text-gray-600">{initialEvidence.condition}</p>
              ) : null}
              <DealEvidenceBlock
                productId={productId}
                source="detail_mobile"
                evidence={initialEvidence}
              />
            </>
          )}
          {tossData && <TossBadges toss={tossData} hidePriceSignals={hidePrice} />}
          <InlineBuyFallback productId={productId} />
        </div>
      </div>
      {/* 구매 정보 — 라벨 왼쪽·값 옆 줄바꿈 한 모양(detailInfo). 가격 요약과는 선 하나로 나눈다. */}
      <dl
        className={cn('mt-5 flex flex-col border-t border-gray-100 pt-5', detailInfo.list)}
        aria-label="구매 정보"
      >
        <DetailInfoRow label="쇼핑몰" variant="mobile" valueClassName="flex items-center gap-x-1">
          {tossData && <TossIcon size={20} />}
          {!tossData && naverbcData && <NaverIcon height={12} />}
          {tossData ? '토스' : ohouData ? '오늘의집' : product.mallName}
        </DetailInfoRow>
        {/* 서버가 가이드를 넘겨줬으면 Suspense 없이 첫 렌더에 그린다(깜빡임·CLS 제거).
            못 받았을 때만 기존 쿼리 경로로 폴백. */}
        {initialGuides ? (
          <ProductGuideMetaRows
            productId={productId}
            variant="mobile"
            initialGuides={initialGuides}
            hiddenIds={initialEvidence?.hiddenGuideIds}
            hidePrice={hidePrice}
          />
        ) : (
          <Suspense fallback={null}>
            <ProductGuideMetaRows
              productId={productId}
              variant="mobile"
              hiddenIds={initialEvidence?.hiddenGuideIds}
              hidePrice={hidePrice}
            />
          </Suspense>
        )}
        {product.uploaderType !== UploaderType.Crawled && (
          <DetailInfoRow
            label="업로드"
            variant="mobile"
            valueClassName={cn('flex items-center gap-1', {
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
          </DetailInfoRow>
        )}
        {displayData?.sellerName && (
          <DetailInfoRow label="판매자" variant="mobile">
            {displayData.sellerName}
          </DetailInfoRow>
        )}
        {deliveryText && (
          <DetailInfoRow label="배송비" variant="mobile">
            {deliveryText}
          </DetailInfoRow>
        )}
      </dl>
      {product.uploaderType === UploaderType.User && product.content && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-medium text-gray-500">상품 설명</h2>
          <p className={cn(text.body, 'leading-relaxed whitespace-pre-wrap')}>{product.content}</p>
        </div>
      )}
    </section>
  );
}
