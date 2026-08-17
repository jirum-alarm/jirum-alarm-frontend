'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useEffect, useState } from 'react';

import { UploaderType } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';
import { pushRecentViewedProduct } from '@/shared/lib/recentViewedProducts';
import Button from '@/shared/ui/common/Button';
import Jirume from '@/shared/ui/common/icons/Jirume';
import DisplayPrice from '@/shared/ui/DisplayPrice';
import DisplayTime from '@/shared/ui/DisplayTime';
import HotdealBadge from '@/shared/ui/HotdealBadge';
import ShareButton from '@/shared/ui/ShareButton';

import { ProductQueries } from '@/entities/product';
import NaverIcon from '@/entities/product/ui/NaverIcon';
import TossBadges from '@/entities/product/ui/TossBadges';
import TossIcon from '@/entities/product/ui/TossIcon';

import { LikeButton, RecommendButton } from '@/features/product-actions/ui';
import { useProductPurchaseStatusClarity } from '@/features/product-detail/hooks/useProductPurchaseStatusClarity';
import {
  buildPostPurchasePromptQueue,
  type PostPurchasePromptKind,
} from '@/features/product-detail/lib/okachat';
import ViewerCount from '@/features/product-detail/ui/desktop/ViewerCount';
import PostPurchaseKakaoPrompt from '@/features/product-detail/ui/PostPurchaseKakaoPrompt';
import PostPurchaseKeywordPrompt from '@/features/product-detail/ui/PostPurchaseKeywordPrompt';
import ProductGuideMetaRows from '@/features/product-detail/ui/ProductGuideMetaRows';

export default function ProductInfo({
  productId,
  isUserLogin,
  tossData,
  naverbcData,
  ohouData,
}: {
  productId: number;
  isUserLogin: boolean;
  tossData?: import('@/entities/product/model/toss-data').TossProductData;
  naverbcData?: import('@/entities/product/model/toss-data').NaverbcProductData;
  ohouData?: import('@/entities/product/model/toss-data').OhouProductData;
}) {
  // 가격/할인율/평점/쿠폰 UI는 소스 무관 공통 필드라 토스·오늘의집이 같은 블록을 공유한다.
  // 배송비(deliveryFee)·단위가격(unitPrice) 등 토스 전용 필드는 tossData 에서만 그대로 쓴다.
  const displayData = tossData ?? ohouData;
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const [promptQueue, setPromptQueue] = useState<PostPurchasePromptKind[]>([]);
  const phase = promptQueue[0] ?? null;
  const advancePrompt = () => setPromptQueue((q) => q.slice(1));

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
        <div className="h-0.5 w-full bg-gray-600" />
        <div className="space-y-4 pt-6 pb-4">
          {(product.isEnd || (!product.isEnd && product.hotDealType)) && (
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
          )}

          <div className="flex items-start justify-between gap-x-5">
            <h1 className="min-w-0 flex-1 text-xl font-medium text-gray-800">{product.title}</h1>
            <div className="shrink-0 self-start">
              <ShareButton
                title={shareTitle}
                description={
                  [product.price, product.mallName].filter(Boolean).join(' · ') || undefined
                }
                imageUrl={product.thumbnail ?? undefined}
              />
            </div>
          </div>
        </div>
        <div className="space-y-1 pt-3 pb-8">
          <div className="h-5 text-sm text-gray-500">
            <DisplayTime time={product.postedAt} />
          </div>
          <div className="flex justify-between">
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
          {tossData && <TossBadges toss={tossData} />}
        </div>
        {product.viewCount >= 10 && <ViewerCount count={product.viewCount} />}
        <div className="my-6 space-y-2">
          <div className="flex text-sm font-medium">
            <span className="inline-block w-[110px] text-gray-400">쇼핑몰</span>
            <span className="flex items-center gap-x-1 text-gray-500">
              {tossData && <TossIcon size={20} />}
              {!tossData && naverbcData && <NaverIcon height={12} />}
              {tossData ? '토스' : ohouData ? '오늘의집' : product.mallName}
            </span>
          </div>
          <Suspense fallback={null}>
            <ProductGuideMetaRows productId={productId} variant="desktop" />
          </Suspense>
          {product.uploaderType !== UploaderType.Crawled && (
            <div className="flex text-sm font-medium">
              <span className="inline-block w-[110px] text-gray-400">업로드</span>
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
            <div className="flex text-sm font-medium">
              <span className="inline-block w-[110px] text-gray-400">판매자</span>
              <span className="text-gray-500">{displayData.sellerName}</span>
            </div>
          )}
          {tossData && (
            <div className="flex text-sm font-medium">
              <span className="inline-block w-[110px] text-gray-400">배송비</span>
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
            <div className="flex text-sm font-medium">
              <span className="inline-block w-[110px] text-gray-400">배송비</span>
              <span className="text-gray-500">{ohouData.delivery}</span>
            </div>
          )}
        </div>
        {product.uploaderType === UploaderType.User && product.content && (
          <div className="my-6">
            <h2 className="mb-2 text-sm font-medium text-gray-400">상품 설명</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
              {product.content}
            </p>
          </div>
        )}
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
            // 모바일 BottomCTA 와 동일 — GTM Click URL 빈값 문제로 dataLayer 명시 전송 (2026-07-20)
            onClick={() => {
              setPromptQueue(buildPostPurchasePromptQueue(isUserLogin));

              if (typeof window === 'undefined') return;
              (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
                event: 'purchase_link_click',
                product_id: String(productId),
                click_url: product.detailUrl ?? '',
                monetized: product.isProfitUrl ?? false,
                profit_provider: product.profitLinkProvider ?? null,
              });
            }}
            className="block flex-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="h-[48px] w-full px-6 text-base font-semibold">구매하러 가기</Button>
          </a>
        </div>
        {/* 데스크톱은 fixed 하단 바가 없어 모바일 BottomCTA 를 그대로 못 옮긴다.
            구매 버튼 바로 아래에 두어 "구매 클릭 직후"라는 같은 맥락을 유지한다. */}
        <div className="mt-3">
          <PostPurchaseKakaoPrompt
            show={phase === 'kakao'}
            onClose={advancePrompt}
            className="rounded-lg border border-gray-100 px-4"
          />
          <PostPurchaseKeywordPrompt
            show={phase === 'keyword'}
            title={product.title ?? ''}
            onClose={advancePrompt}
            className="rounded-lg border border-gray-100 px-4"
          />
        </div>
      </div>
    </section>
  );
}
