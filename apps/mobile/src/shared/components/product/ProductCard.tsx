import React from 'react';
import {Image, Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';

import {HotDealType} from '@/shared/api/gql/graphql';
import HotdealBadge from '@/shared/components/product/HotdealBadge';
import DisplayProductSource from '@/shared/components/product/DisplayProductSource';
import NoImage from '@/shared/components/product/NoImage';
import {displayTime, parsePrice} from '@/shared/lib/format/price';

export type ProductCardItem = {
  id: string | number;
  title: string;
  price?: string | null;
  thumbnail?: string | null;
  categoryId?: number | null;
  isEnd?: boolean | null;
  hotDealType?: HotDealType | null;
  mallName?: string | null;
  postedAt?: string | null;
  earliestExpiryDate?: string | null;
  provider?: {nameKr?: string | null} | null;
};

/** web formatDateToMMD 와 같은 표기(MM.DD). dayjs 없이 처리한다. */
function formatMMD(date: string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

const CARD_WIDTH = 120;

export default function ProductCard({
  product,
  onPress,
  layout = 'fixed',
}: {
  product: ProductCardItem;
  onPress: (id: number) => void;
  /** fixed: 캐러셀용 120px. grid: 만료 추천 3열. */
  layout?: 'fixed' | 'grid';
}) {
  const {hasWon, priceWithoutWon} = parsePrice(product.price);
  const priceText = hasWon ? `${priceWithoutWon}원` : priceWithoutWon;
  const isGrid = layout === 'grid';

  return (
    <PressableScale
      style={isGrid ? {width: '100%'} : {width: CARD_WIDTH}}
      onPress={() => onPress(Number(product.id))}
      accessibilityRole="button"
      accessibilityLabel={product.title}>
      <View>
        <View
          className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
          style={
            isGrid
              ? {width: '100%', aspectRatio: 1}
              : {width: CARD_WIDTH, height: CARD_WIDTH}
          }>
          {product.thumbnail ? (
            <Image
              source={{uri: product.thumbnail}}
              style={{width: '100%', height: '100%'}}
              resizeMode="cover"
            />
          ) : (
            <NoImage categoryId={product.categoryId} type="hotDeal" />
          )}

          {product.isEnd ? (
            <View className="absolute bottom-0 left-0 h-[22px] items-center justify-center rounded-tr-lg rounded-bl-lg bg-white px-2">
              <Text className="text-xs font-semibold text-gray-700">
                판매종료
              </Text>
            </View>
          ) : product.hotDealType ? (
            <View className="absolute bottom-0 left-0">
              <HotdealBadge
                hotdealType={product.hotDealType}
                badgeVariant="card"
              />
            </View>
          ) : null}

          {product.earliestExpiryDate && !product.isEnd ? (
            <View className="absolute inset-x-0 bottom-0 h-[22px] items-center justify-center bg-gray-700/80 px-2">
              <Text className="text-xs font-semibold text-white">
                유통기한 {formatMMD(product.earliestExpiryDate)}
              </Text>
            </View>
          ) : null}
        </View>

        {/* 제목은 2줄 고정 — 높이를 안 잡으면 아래 가격 줄이 카드마다 어긋난다. */}
        <Text
          className="pt-2 text-sm text-gray-700"
          style={{height: 40}}
          numberOfLines={2}>
          {product.title}
        </Text>
        <DisplayProductSource
          mallName={product.mallName}
          providerName={product.provider?.nameKr}
          time={product.postedAt ? displayTime(product.postedAt) : undefined}
        />
        <Text
          className="pt-1 text-lg font-semibold text-gray-900"
          numberOfLines={1}>
          {priceText}
        </Text>
      </View>
    </PressableScale>
  );
}
