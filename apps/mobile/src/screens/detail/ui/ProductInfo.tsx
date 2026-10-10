import React from 'react';
import {View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';

import {HotDealType, UploaderType} from '@/shared/api/gql/graphql';
import DisplayPrice from '@/shared/components/product/DisplayPrice';
import HotdealBadge from '@/shared/components/product/HotdealBadge';
import {displayTime} from '@/shared/lib/format/price';

import ProductGuideMetaRows from './ProductGuideMetaRows';
import RecommendButton from './RecommendButton';
import TossBadges from './TossBadges';
import TossIcon from './TossIcon';
import NaverIcon from './NaverIcon';
import DealEvidenceBlock, {
  type DealEvidence,
  type EvidenceTarget,
} from './DealEvidenceBlock';

import {
  formatFreeShipping,
  type ProductDetail,
  type SourceData,
} from '../model/types';
import {dealFreshnessAt, isSeenBasedFreshness} from '../lib/price-signals';
import {stripPriceFromTitle} from '@/entities/home/lib/toss';
import Badge from '@/shared/components/ui/Badge';

/** 라벨/값 한 줄. 색은 web ProductInfo 와 동일하게 맞춘다(사용자 결정 2026-08-12). */
function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm font-medium text-gray-500">{label}</Text>
      <View className="flex-row items-center gap-x-1">{children}</View>
    </View>
  );
}

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
  // 가격/할인율/평점/쿠폰은 소스 무관 공통 필드라 토스·오늘의집이 같은 블록을 쓴다.
  const display = source.toss ?? source.ohou;
  const displayTitle = hidePrice
    ? stripPriceFromTitle(product.title)
    : product.title;

  return (
    <View className="px-5 pb-9">
      <View className="flex-row items-center gap-3 pb-2">
        {product.isEnd ? (
          <Badge size="tag" variant="outline" tone="gray">
            판매종료
          </Badge>
        ) : product.hotDealType ? (
          // 배지가 왜 붙었는지는 가격 아래 근거 블록이 말한다(대부분 커뮤니티 인기글).
          <HotdealBadge
            hotdealType={product.hotDealType as HotDealType}
            badgeVariant="page"
          />
        ) : null}
      </View>

      {/* web ProductInfo 순서: 제목 → 시간 → (가격+평점 | 추천버튼).
          한때 가격을 제목 위로 올렸었지만 "웹과 동일" 방침으로 되돌렸다. */}
      <Text className="font-medium text-gray-800">{displayTitle}</Text>

      <View className="gap-y-1 pt-3">
        <Text className="h-5 text-sm text-gray-600">
          {displayTime(dealFreshnessAt(product) ?? product.postedAt)}
          {isSeenBasedFreshness(product) ? ' 확인' : ''}
        </Text>

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

      {/* web 순서: 추천 버튼 줄 → 가격 조건 줄 → 근거 블록 → 토스 뱃지. */}
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

      <View className="gap-y-2 pt-4">
        <MetaRow label="쇼핑몰">
          {source.toss ? <TossIcon size={20} /> : null}
          {!source.toss && source.naverbc ? <NaverIcon height={12} /> : null}
          <Text className="text-sm font-medium text-gray-500">
            {source.toss ? '토스' : source.ohou ? '오늘의집' : product.mallName}
          </Text>
        </MetaRow>

        <ProductGuideMetaRows
          productId={productId}
          hiddenIds={evidence?.hiddenGuideIds}
          hidePrice={hidePrice}
        />

        {product.uploaderType !== UploaderType.Crawled ? (
          <MetaRow label="업로드">
            <Text
              className={
                product.uploaderType === UploaderType.Official
                  ? 'text-sm font-medium text-primary-800'
                  : 'text-sm font-medium text-gray-600'
              }>
              {product.uploaderType === UploaderType.Official
                ? '지름알림'
                : product.author?.nickname ?? ''}
            </Text>
          </MetaRow>
        ) : null}

        {display?.sellerName ? (
          <MetaRow label="판매자">
            <Text className="text-sm font-medium text-gray-500">
              {display.sellerName}
            </Text>
          </MetaRow>
        ) : null}

        {source.toss ? (
          <MetaRow label="배송비">
            <Text className="text-sm font-medium text-gray-500">
              {source.toss.deliveryFee
                ? `${source.toss.deliveryFee.toLocaleString()}원` +
                  (source.toss.freeShippingThreshold
                    ? ` (${formatFreeShipping(
                        source.toss.freeShippingThreshold,
                      )})`
                    : '')
                : '무료배송'}
            </Text>
          </MetaRow>
        ) : source.ohou?.delivery ? (
          <MetaRow label="배송비">
            <Text className="text-sm font-medium text-gray-500">
              {source.ohou.delivery}
            </Text>
          </MetaRow>
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
