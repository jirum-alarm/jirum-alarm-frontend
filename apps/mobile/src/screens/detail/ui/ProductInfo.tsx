import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import {HotDealType, UploaderType} from '@/shared/api/gql/graphql';
import DisplayPrice from '@/shared/components/product/DisplayPrice';
import {displayTime} from '@/shared/lib/format/price';
import {useNowMinute} from '@/shared/hooks/useNow';

import ProductGuideMetaRows, {DetailInfoRow} from './ProductGuideMetaRows';
import HotdealCriteriaBadge from './HotdealCriteriaBadge';
import RecommendButton from './RecommendButton';
import TossBadges from './TossBadges';
import TossIcon from './TossIcon';
import TimeDealDetailTimer from './TimeDealDetailTimer';
import NaverIcon from './NaverIcon';
import DealEvidenceBlock, {
  type DealEvidence,
  type EvidenceTarget,
} from './DealEvidenceBlock';

import {
  formatDeliveryText,
  type ProductDetail,
  type SourceData,
} from '../model/types';
import {dealFreshnessAt, isSeenBasedFreshness} from '../lib/price-signals';
import {stripPriceFromTitle} from '@/entities/home/lib/toss';
import Badge from '@/shared/components/ui/Badge';
import {detailInfo} from '@jirum/design-system/recipes';
import {cn} from '@/shared/lib/styling';

export default function ProductInfo({
  product,
  source,
  productId,
  isUserLogin,
  hidePrice,
  evidence,
  onPressEvidenceMore,
}: {
  product: ProductDetail;
  source: SourceData;
  productId: number;
  isUserLogin: boolean;
  hidePrice?: boolean;
  /** 왜 핫딜인지 — 근거 블록·가격 조건 줄·정보 표에서 뺄 행(서버 dealEvidence) */
  evidence?: DealEvidence | null;
  onPressEvidenceMore?: (target: EvidenceTarget) => void;
}) {
  const now = useNowMinute();
  // 가격/할인율/평점/쿠폰은 소스 무관 공통 필드라 토스·오늘의집이 같은 블록을 쓴다.
  const display = source.toss ?? source.ohou;
  const displayTitle = hidePrice
    ? stripPriceFromTitle(product.title)
    : product.title;
  const deliveryText = formatDeliveryText(source);

  return (
    <View className="px-5 pb-6">
      {/* 배지 줄 오른쪽에 게시 시각 — web 과 같은 자리. 가격 위에 시각 줄을 따로 두면 첫 화면에서 가격이 밀린다. */}
      <View className="min-h-[22px] flex-row items-center gap-3 pb-2">
        {product.isEnd ? (
          <Badge size="tag" variant="outline" tone="gray">
            판매종료
          </Badge>
        ) : product.hotDealType ? (
          // 배지 뜻 한 줄 + 누르면 기준 시트. 이 딜의 구체적 근거는 가격 아래 근거 블록이 말한다.
          <HotdealCriteriaBadge
            hotdealType={product.hotDealType as HotDealType}
          />
        ) : null}
        <Text className="ml-auto shrink-0 text-sm text-gray-600">
          {displayTime(dealFreshnessAt(product) ?? product.postedAt, now)}
          {isSeenBasedFreshness(product) ? ' 확인' : ''}
        </Text>
      </View>

      <Text className="font-medium text-gray-800">{displayTitle}</Text>

      <View className="gap-y-1 pt-3">
        <View className="flex-row items-center justify-between gap-x-3">
          <View className="min-w-0 flex-1">
            {hidePrice ? (
              <Text className="text-lg font-semibold text-gray-900">
                토스에서 가격 확인
              </Text>
            ) : (
              <>
                {display?.originalPrice ? (
                  // gray-400 은 흰 배경 대비 AA 미달이라 gray-500.
                  <Text className="text-sm text-gray-500 line-through">
                    {display.originalPrice.toLocaleString()}원
                  </Text>
                ) : null}
                {/* 좁으면 할인율·가격이 통째로 넘어간다(숫자 중간에서 쪼개지지 않게). */}
                <View className="flex-row flex-wrap items-baseline gap-x-2">
                  {typeof display?.discountRate === 'number' ? (
                    <Text className="text-2xl font-bold text-error-500">
                      {display.discountRate}%
                    </Text>
                  ) : null}
                  <DisplayPrice price={product.price} />
                </View>
              </>
            )}
          </View>
          <RecommendButton productId={productId} isUserLogin={isUserLogin} />
        </View>
        {/* 평점·쿠폰은 추천 버튼 옆 좁은 칸이 아니라 한 줄 전체를 쓴다 — 거기선 쿠폰 문구가
            셋째 줄로 꺾였다(1rem 16px 이후 추천 버튼이 넓어짐). */}
        {display &&
        (typeof display.rating === 'number' ||
          (!hidePrice && display.couponDiscount)) ? (
          <View className="flex-row flex-wrap items-center gap-x-2 pt-1">
            {typeof display.rating === 'number' ? (
              <Text className="text-sm text-gray-500">
                <Text className="text-warning-400">★</Text> {display.rating}
                {display.reviewCount
                  ? ` (${display.reviewCount.toLocaleString()})`
                  : ''}
              </Text>
            ) : null}
            {!hidePrice && display.couponDiscount ? (
              <Text className="text-sm text-error-500">
                쿠폰{' '}
                {typeof display.couponDiscount === 'number'
                  ? `${display.couponDiscount.toLocaleString()}원 추가할인`
                  : display.couponDiscount}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {/* 선착순·타임특가면 가격 바로 아래 종료/오픈 타이머(web 과 같은 자리) */}
      <TimeDealDetailTimer product={product} />

      {/* web 순서: 추천 버튼 줄 → 타이머 → 가격 조건 줄 → 근거 블록 → 토스 뱃지. */}
      {!hidePrice ? (
        <>
          {/* 가격은 조건과 붙어 있어야 뜻이 선다 — 페이코 27.5% 할인가·배송비 2,500원 별도 */}
          {evidence?.condition ? (
            <Text className="pt-1 text-sm text-gray-600" numberOfLines={1}>
              {evidence.condition}
            </Text>
          ) : null}
          <DealEvidenceBlock
            productId={productId}
            evidence={evidence}
            onPressMore={target => onPressEvidenceMore?.(target)}
          />
        </>
      ) : null}

      {source.toss ? (
        <TossBadges toss={source.toss} hidePriceSignals={hidePrice} />
      ) : null}

      {/* 구매 정보 — 가격 요약과는 선 하나로 나눈다(web 과 같다). */}
      <View
        className={cn('mt-5 border-t border-gray-100 pt-5', detailInfo.list)}>
        <DetailInfoRow label="쇼핑몰">
          {source.toss ? <TossIcon size={20} /> : null}
          {!source.toss && source.naverbc ? <NaverIcon height={12} /> : null}
          <Text className={detailInfo.value}>
            {source.toss ? '토스' : source.ohou ? '오늘의집' : product.mallName}
          </Text>
        </DetailInfoRow>

        <ProductGuideMetaRows
          productId={productId}
          hiddenIds={evidence?.hiddenGuideIds}
          hidePrice={hidePrice}
        />

        {product.uploaderType !== UploaderType.Crawled ? (
          <DetailInfoRow label="업로드">
            <Text
              className={cn(
                detailInfo.value,
                product.uploaderType === UploaderType.Official &&
                  'text-primary-800',
              )}>
              {product.uploaderType === UploaderType.Official
                ? '지름알림'
                : product.author?.nickname ?? ''}
            </Text>
          </DetailInfoRow>
        ) : null}

        {display?.sellerName ? (
          <DetailInfoRow label="판매자">
            <Text className={detailInfo.value}>{display.sellerName}</Text>
          </DetailInfoRow>
        ) : null}

        {deliveryText ? (
          <DetailInfoRow label="배송비">
            <Text className={detailInfo.value}>{deliveryText}</Text>
          </DetailInfoRow>
        ) : null}
      </View>

      {product.uploaderType === UploaderType.User && product.content ? (
        <View className="mt-6">
          <Text className="mb-2 text-sm font-medium text-gray-500">
            상품 설명
          </Text>
          <Text className="text-sm leading-relaxed text-gray-700">
            {product.content}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
