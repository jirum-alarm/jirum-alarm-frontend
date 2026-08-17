import React from 'react';
import {Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import DisplayProductSource from '@/shared/components/product/DisplayProductSource';
import HotdealBadge from '@/shared/components/product/HotdealBadge';
import {displayTime} from '@/shared/lib/format/price';
import type {HotDealType} from '@/shared/api/gql/graphql';

import type {ProductCardType} from '../../model/types';
import {
  CardThumbnail,
  CardTitle,
  DisplayListPrice,
  formatMMD,
} from './HomeCardPrimitives';

/**
 * 홈 SDUI 카드 4종. web 과 1:1 대조해서 옮겼다.
 *
 * | 네이티브 | web |
 * | --- | --- |
 * | GridCard      | entities/product-list/ui/grid/ProductGridCard.tsx |
 * | CarouselCard  | entities/product-list/ui/carousel/CarouselProductCard.tsx |
 * | ListCard      | entities/product-list/ui/list/ListProductCard.tsx |
 * | DoubleRowCard | entities/product-list/ui/card/DoubleRowProductCard.tsx |
 *
 * web 의 `whileTap={{scale:0.95}}` 는 PressableScale 이 대신한다.
 */

type CardProps = {
  product: ProductCardType;
  onPress: (id: number) => void;
};

/** GRID · PAGINATED_GRID · GRID_TABBED. 정사각 썸네일, 가격만 text-base 로 작다. */
export function GridCard({
  product,
  onPress,
  showTime = true,
}: CardProps & {showTime?: boolean}) {
  return (
    <PressableScale
      style={{width: '100%'}}
      onPress={() => onPress(Number(product.id))}
      accessibilityRole="button"
      accessibilityLabel={product.title}>
      <CardThumbnail
        product={product}
        style={{width: '100%', aspectRatio: 1}}
        thumbnailType="product"
      />
      <View>
        <CardTitle title={product.title} />
        <DisplayProductSource
          mallName={product.mallName}
          providerName={product.provider?.nameKr}
          time={
            showTime && product.postedAt
              ? displayTime(product.postedAt)
              : undefined
          }
        />
        <View className="pt-1">
          {/* web: grid 만 text-base 로 덮는다 */}
          <DisplayListPrice price={product.price} className="text-base" />
        </View>
      </View>
    </PressableScale>
  );
}

/** HORIZONTAL_SCROLL. 120px 고정 폭. */
export const CAROUSEL_CARD_WIDTH = 120;

export function CarouselCard({product, onPress}: CardProps) {
  return (
    <PressableScale
      style={{width: CAROUSEL_CARD_WIDTH}}
      onPress={() => onPress(Number(product.id))}
      accessibilityRole="button"
      accessibilityLabel={product.title}>
      <CardThumbnail
        product={product}
        style={{width: CAROUSEL_CARD_WIDTH, height: CAROUSEL_CARD_WIDTH}}
        thumbnailType="hotDeal"
      />
      <View>
        <CardTitle title={product.title} />
        <DisplayProductSource
          mallName={product.mallName}
          providerName={product.provider?.nameKr}
          time={product.postedAt ? displayTime(product.postedAt) : undefined}
        />
        <View className="pt-1">
          <DisplayListPrice price={product.price} />
        </View>
      </View>
    </PressableScale>
  );
}

/**
 * LIST(프리미엄 핫딜). 가로 배치 76px 썸네일.
 * ★ web 은 시간을 displayTime 이 아니라 **formatDateToMMD** 로 쓴다(카드마다 다름).
 */
export function ListCard({product, onPress}: CardProps) {
  return (
    <PressableScale
      onPress={() => onPress(Number(product.id))}
      accessibilityRole="button"
      accessibilityLabel={product.title}>
      <View className="flex-row items-center gap-4">
        <CardThumbnail
          product={product}
          style={{width: 76, height: 76}}
          thumbnailType="product"
        />
        <View className="flex-1 gap-1">
          <Text className="text-sm text-gray-700" numberOfLines={2}>
            {product.title}
          </Text>
          <View className="flex-row items-center gap-2">
            <DisplayListPrice price={product.price} />
            {product.hotDealType && !product.isEnd ? (
              <HotdealBadge
                hotdealType={product.hotDealType as HotDealType}
                badgeVariant="page"
              />
            ) : null}
          </View>
          <DisplayProductSource
            mallName={product.mallName}
            providerName={product.provider?.nameKr}
            time={product.postedAt ? formatMMD(product.postedAt) : undefined}
          />
        </View>
      </View>
    </PressableScale>
  );
}

/**
 * DOUBLE_ROW(유통기한 임박). 가로 배치 120px 썸네일, 시간 표기 없음.
 * web 은 이 카드에서 DisplayProductSource 에 time 을 안 넘긴다.
 */
export function DoubleRowCard({product, onPress}: CardProps) {
  return (
    <PressableScale
      onPress={() => onPress(Number(product.id))}
      accessibilityRole="button"
      accessibilityLabel={product.title}>
      <View className="w-full flex-row items-start gap-2">
        <CardThumbnail
          product={product}
          style={{width: 120, height: 120}}
          thumbnailType="product"
        />
        <View className="flex-1 gap-2">
          <Text className="text-sm text-gray-800" numberOfLines={2}>
            {product.title}
          </Text>
          <DisplayProductSource
            mallName={product.mallName}
            providerName={product.provider?.nameKr}
          />
          <View className="flex-row items-center gap-2">
            <DisplayListPrice price={product.price} />
            {product.hotDealType && !product.isEnd ? (
              <HotdealBadge
                hotdealType={product.hotDealType as HotDealType}
                badgeVariant="page"
              />
            ) : null}
          </View>
        </View>
      </View>
    </PressableScale>
  );
}
