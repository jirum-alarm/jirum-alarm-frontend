import React, {useState} from 'react';
import {Text, View} from 'react-native';

import {HotDealType, UploaderType} from '@/shared/api/gql/graphql';
import DisplayPrice from '@/shared/components/product/DisplayPrice';
import HotdealBadge from '@/shared/components/product/HotdealBadge';
import {displayTime} from '@/shared/lib/format/price';

import ProductGuideMetaRows from './ProductGuideMetaRows';
import HotdealGuideModal from './HotdealGuideModal';
import PressableScale from '@/shared/components/PressableScale';
import RecommendButton from './RecommendButton';
import TossBadges from './TossBadges';
import TossIcon from './TossIcon';
import NaverIcon from './NaverIcon';

import type {ProductDetail, SourceData} from '../model/types';

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
      <Text className="text-sm font-medium text-gray-400">{label}</Text>
      <View className="flex-row items-center gap-x-1">{children}</View>
    </View>
  );
}

export default function ProductInfo({
  product,
  source,
  productId,
  isUserLogin,
}: {
  product: ProductDetail;
  source: SourceData;
  productId: number;
  isUserLogin: boolean;
}) {
  // 가격/할인율/평점/쿠폰은 소스 무관 공통 필드라 토스·오늘의집이 같은 블록을 쓴다.
  const display = source.toss ?? source.ohou;
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <View className="px-5 pb-9">
      <View className="flex-row items-center gap-3 pb-2">
        {product.isEnd ? (
          <View className="h-[22px] items-center justify-center rounded-lg border border-gray-400 bg-white px-2">
            <Text className="text-xs font-semibold text-gray-700">
              판매종료
            </Text>
          </View>
        ) : product.hotDealType ? (
          <PressableScale
            onPress={() => setGuideOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="핫딜 기준 안내">
            <HotdealBadge
              hotdealType={product.hotDealType as HotDealType}
              badgeVariant="page"
            />
          </PressableScale>
        ) : null}
      </View>

      {/* web ProductInfo 순서: 제목 → 시간 → (가격+평점 | 추천버튼).
          한때 가격을 제목 위로 올렸었지만 "웹과 동일" 방침으로 되돌렸다. */}
      <Text className="font-medium text-gray-800">{product.title}</Text>

      <View className="gap-y-1 pt-3">
        <Text className="h-5 text-sm text-gray-600">
          {displayTime(product.postedAt)}
        </Text>

        <View className="flex-row items-center justify-between">
          <View className="shrink">
            {display?.originalPrice ? (
              <Text className="text-sm text-gray-400 line-through">
                {display.originalPrice.toLocaleString()}원
              </Text>
            ) : null}
            <View className="flex-row items-baseline gap-x-2">
              {typeof display?.discountRate === 'number' ? (
                <Text className="text-2xl font-bold text-error-500">
                  {display.discountRate}%
                </Text>
              ) : null}
              <DisplayPrice price={product.price} />
            </View>
            {display &&
            (typeof display.rating === 'number' || display.couponDiscount) ? (
              <View className="flex-row flex-wrap items-center gap-x-2 pt-1">
                {typeof display.rating === 'number' ? (
                  <Text className="text-sm text-gray-500">
                    <Text className="text-[#ffb200]">★</Text> {display.rating}
                    {display.reviewCount
                      ? ` (${display.reviewCount.toLocaleString()})`
                      : ''}
                  </Text>
                ) : null}
                {display.couponDiscount ? (
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
          <RecommendButton productId={productId} isUserLogin={isUserLogin} />
        </View>
      </View>

      {source.toss ? <TossBadges toss={source.toss} /> : null}

      <View className="gap-y-2 pt-4">
        <MetaRow label="쇼핑몰">
          {source.toss ? <TossIcon size={20} /> : null}
          {!source.toss && source.naverbc ? <NaverIcon height={12} /> : null}
          <Text className="text-sm font-medium text-gray-500">
            {source.toss ? '토스' : source.ohou ? '오늘의집' : product.mallName}
          </Text>
        </MetaRow>

        <ProductGuideMetaRows productId={productId} />

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
                    ? ` (${source.toss.freeShippingThreshold.toLocaleString()}원 이상 무료배송)`
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
          <Text className="mb-2 text-sm font-medium text-gray-400">
            상품 설명
          </Text>
          <Text className="text-sm leading-relaxed text-gray-700">
            {product.content}
          </Text>
        </View>
      ) : null}

      <HotdealGuideModal
        visible={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </View>
  );
}
