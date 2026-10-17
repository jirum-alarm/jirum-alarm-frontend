'use client';

import { detailInfo } from '@jirum/design-system/recipes';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Suspense, useEffect } from 'react';

import { UploaderType } from '@/shared/api/gql/graphql';
import { ProductService } from '@/shared/api/product';
import type { ProductDealEvidence } from '@/shared/api/product/product.service';
import { hotdealTextMap } from '@/shared/config/hotdeal';
import { cn } from '@/shared/lib/cn';
import { pushDataLayerSoon } from '@/shared/lib/data-layer-soon';
import { getEntry } from '@/shared/lib/entry';
import { pushRecentViewedProduct } from '@/shared/lib/recentViewedProducts';
import Badge from '@/shared/ui/common/Badge';
import Button from '@/shared/ui/common/Button';
import Jirume from '@/shared/ui/common/icons/Jirume';
import DisplayPrice from '@/shared/ui/DisplayPrice';
import DisplayTime from '@/shared/ui/DisplayTime';
import ShareButton from '@/shared/ui/ShareButton';

import { ProductQueries } from '@/entities/product';
import { stripPriceFromTitle } from '@/entities/product/lib/from-toss';
import NaverIcon from '@/entities/product/ui/NaverIcon';
import TossBadges from '@/entities/product/ui/TossBadges';
import TossIcon from '@/entities/product/ui/TossIcon';
import { peekNotificationOrigin } from '@/entities/product-list/model/notification-origin';
import TimeDealDetailTimer from '@/entities/promotion/ui/TimeDealDetailTimer';

import { LikeButton, RecommendButton } from '@/features/product-actions/ui';
import { useProductPurchaseStatusClarity } from '@/features/product-detail/hooks/useProductPurchaseStatusClarity';
import { formatDeliveryText } from '@/features/product-detail/lib/delivery-text';
import { dealFreshnessAt, isSeenBasedFreshness } from '@/features/product-detail/lib/product-seo';
import { buildProductShareDescription } from '@/features/product-detail/lib/share-card';
import { useBeautyRoomAssignment } from '@/features/product-detail/lib/useBeautyRoomAssignment';
import { usePostPurchasePrompts } from '@/features/product-detail/lib/usePostPurchasePrompts';
import DealEvidenceBlock from '@/features/product-detail/ui/DealEvidenceBlock';
import HotdealCriteriaBadge from '@/features/product-detail/ui/HotdealCriteriaBadge';
import PostPurchaseKakaoPrompt from '@/features/product-detail/ui/PostPurchaseKakaoPrompt';
import PostPurchaseKeywordPrompt from '@/features/product-detail/ui/PostPurchaseKeywordPrompt';
import ProductGuideMetaRows, {
  DetailInfoRow,
  type GuideRow as ProductGuideRow,
} from '@/features/product-detail/ui/ProductGuideMetaRows';

export default function ProductInfo({
  productId,
  isUserLogin,
  tossData,
  naverbcData,
  ohouData,
  initialGuides,
  initialEvidence,
  hidePrice,
}: {
  productId: number;
  isUserLogin: boolean;
  tossData?: import('@/entities/product/model/toss-data').TossProductData;
  naverbcData?: import('@/entities/product/model/toss-data').NaverbcProductData;
  ohouData?: import('@/entities/product/model/toss-data').OhouProductData;
  initialGuides?: ProductGuideRow[] | null;
  /** 왜 핫딜인지 — 근거 블록·가격 조건 줄·정보 표에서 뺄 행(서버 dealEvidence) */
  initialEvidence?: ProductDealEvidence | null;
  hidePrice?: boolean;
}) {
  // 가격/할인율/평점/쿠폰 UI는 소스 무관 공통 필드라 토스·오늘의집이 같은 블록을 공유한다.
  // 배송비(deliveryFee)·단위가격(unitPrice) 등 토스 전용 필드는 tossData 에서만 그대로 쓴다.
  const displayData = tossData ?? ohouData;
  const { data: product } = useSuspenseQuery(ProductQueries.productInfo({ id: productId }));
  const displayTitle = hidePrice ? stripPriceFromTitle(product.title) : product.title;
  // 화장품 상세 실험 beauty_detail_room_v1 — b 군은 구매 후 권유도 뷰티방(입장 기록도 뷰티방 것으로 본다).
  const beautyRoom = useBeautyRoomAssignment(product.categoryId);
  const {
    phase,
    start: startPrompts,
    advance: advancePrompt,
  } = usePostPurchasePrompts({ productId, isUserLogin, beautyRoom });

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

  const shareTitle = `${displayTitle} | 지름알림`;
  const deliveryText = formatDeliveryText(tossData, ohouData);

  return (
    <section className="flex h-full flex-col justify-between">
      <div>
        <div className="h-0.5 w-full bg-gray-600" />
        <div className="space-y-4 pt-6 pb-4">
          {/* 배지 줄 오른쪽에 게시 시각 — 모바일과 같은 자리. 가격 위에 시각 줄을 따로 두지 않는다. */}
          <div className="flex min-h-[22px] items-center gap-x-2">
            {product.isEnd && (
              <Badge size="tag" variant="outline" tone="gray">
                판매종료
              </Badge>
            )}
            {/* 배지 뜻 한 줄 + 누르면 기준 시트. 이 딜의 구체적 근거는 가격 아래 근거 블록이 말한다. */}
            {!product.isEnd && product.hotDealType && (
              <HotdealCriteriaBadge hotdealType={product.hotDealType} />
            )}
            <div className="ml-auto shrink-0 text-sm text-gray-500">
              <DisplayTime time={dealFreshnessAt(product) ?? product.postedAt} />
              {isSeenBasedFreshness(product) && ' 확인'}
            </div>
          </div>

          <div className="flex items-start justify-between gap-x-5">
            <h1 className="min-w-0 flex-1 text-xl font-medium text-gray-800">{displayTitle}</h1>
            <div className="shrink-0 self-start">
              <ShareButton
                title={shareTitle}
                description={buildProductShareDescription({
                  price: product.price,
                  mallName: product.mallName,
                  badge: product.hotDealType ? hotdealTextMap[product.hotDealType] : null,
                  isEnd: product.isEnd,
                  hidePrice,
                })}
                imageUrl={product.thumbnail ?? undefined}
              />
            </div>
          </div>
        </div>
        <div className="space-y-1 pb-6">
          <div className="flex justify-between">
            <div>
              {hidePrice ? (
                <p className="text-lg font-semibold text-gray-900">토스에서 가격 확인</p>
              ) : (
                <>
                  {displayData?.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
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
                  <div className="flex flex-wrap items-center gap-x-2 pt-1 text-sm text-gray-500">
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
                source="detail_desktop"
                evidence={initialEvidence}
              />
            </>
          )}
          {tossData && <TossBadges toss={tossData} hidePriceSignals={hidePrice} />}
        </div>
        {/* 구매 정보 — 라벨 왼쪽·값 옆 줄바꿈 한 모양(detailInfo). 가격 요약과는 선 하나로 나눈다. */}
        <dl
          className={cn('mb-6 flex flex-col border-t border-gray-100 pt-6', detailInfo.list)}
          aria-label="구매 정보"
        >
          <DetailInfoRow
            label="쇼핑몰"
            variant="desktop"
            valueClassName="flex items-center gap-x-1"
          >
            {tossData && <TossIcon size={20} />}
            {!tossData && naverbcData && <NaverIcon height={12} />}
            {tossData ? '토스' : ohouData ? '오늘의집' : product.mallName}
          </DetailInfoRow>
          {/* 서버가 가이드를 넘겨줬으면 Suspense 없이 첫 렌더에 그린다(깜빡임·CLS 제거). */}
          {initialGuides ? (
            <ProductGuideMetaRows
              productId={productId}
              variant="desktop"
              initialGuides={initialGuides}
              hiddenIds={initialEvidence?.hiddenGuideIds}
              hidePrice={hidePrice}
            />
          ) : (
            <Suspense fallback={null}>
              <ProductGuideMetaRows
                productId={productId}
                variant="desktop"
                hiddenIds={initialEvidence?.hiddenGuideIds}
                hidePrice={hidePrice}
              />
            </Suspense>
          )}
          {product.uploaderType !== UploaderType.Crawled && (
            <DetailInfoRow
              label="업로드"
              variant="desktop"
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
            <DetailInfoRow label="판매자" variant="desktop">
              {displayData.sellerName}
            </DetailInfoRow>
          )}
          {deliveryText && (
            <DetailInfoRow label="배송비" variant="desktop">
              {deliveryText}
            </DetailInfoRow>
          )}
        </dl>
        {product.uploaderType === UploaderType.User && product.content && (
          <div className="mb-6">
            <h2 className="mb-2 text-sm font-medium text-gray-500">상품 설명</h2>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">
              {product.content}
            </p>
          </div>
        )}
      </div>
      <div>
        <div className="flex w-full gap-x-4">
          <div className="flex h-12 items-center">
            <Suspense>
              <LikeButton productId={productId} isUserLogin={isUserLogin} />
            </Suspense>
          </div>
          <a
            href={product.detailUrl ?? ''}
            // 모바일 BottomCTA 와 동일 — GTM Click URL 빈값 문제로 dataLayer 명시 전송 (2026-07-20)
            onClick={() => {
              startPrompts();
              // 푸시로 들어온 상세면 그 발송 nid 도 — 알림 → 구매 귀속(notification-origin).
              const nid = peekNotificationOrigin(productId);
              void ProductService.collectPurchaseClick({
                productId,
                source: 'detail_desktop',
                entry: getEntry(),
                nid,
              }).catch(() => {});

              pushDataLayerSoon({
                event: 'purchase_link_click',
                product_id: String(productId),
                click_url: product.detailUrl ?? '',
                monetized: product.isProfitUrl ?? false,
                profit_provider: product.profitLinkProvider ?? null,
                nid,
              });
            }}
            className="block flex-1"
            target="_blank"
            // 제휴 아웃바운드 — 크롤러가 따라가 봇클릭을 만들지 않게 nofollow/sponsored
            rel="nofollow sponsored noopener noreferrer"
          >
            <Button className="h-12 w-full px-6 text-base font-semibold">구매하러 가기</Button>
          </a>
        </div>
        {/* 데스크톱은 fixed 하단 바가 없어 모바일 BottomCTA 를 그대로 못 옮긴다.
            구매 버튼 바로 아래에 두어 "구매 클릭 직후"라는 같은 맥락을 유지한다. */}
        <div className="mt-3">
          <PostPurchaseKakaoPrompt
            show={phase === 'kakao'}
            onClose={advancePrompt}
            className="rounded-lg border border-gray-100 px-4"
            beautyRoom={beautyRoom}
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
