import {prefetchProductDetail} from '@/entities/product/prefetch-detail';
import React from 'react';
import {View} from 'react-native';
import {cardThumb, productCard} from '@jirum/design-system/recipes';
import {Text} from '@/shared/components/ui/Text/AppText';
import {cn} from '@/shared/lib/styling/className';

import PressableScale from '@/shared/components/PressableScale';

import {HotDealType} from '@/shared/api/gql/graphql';
import DisplayProductSource from '@/shared/components/product/DisplayProductSource';
import Thumbnail from '@/shared/components/product/Thumbnail';
import {
  trackProductCardClick,
  type ProductCardSource,
} from '@/shared/lib/analytics/card-tracking';
import {displayTime, parsePrice} from '@/shared/lib/format/price';
import {useNowMinute} from '@/shared/hooks/useNow';
import ProductCardStatus from '@/shared/components/product/ProductCardStatus';

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
  postedCommunityCount?: number | null;
  isYearLowest?: boolean | null;
};

const CARD_WIDTH = 120;

// ★memo — 캐러셀·만료 추천 그리드에 여러 장이 깔려서, 부모가 다시 그릴 때
// 카드가 같이 그려지지 않게 한다(product 는 쿼리 캐시 객체라 참조가 유지된다).
const ProductCard = React.memo(function ProductCard({
  product,
  onPress,
  layout = 'fixed',
  trackingSource,
}: {
  product: ProductCardItem;
  onPress: (id: number) => void;
  /** fixed: 캐러셀용 120px. grid: 만료 추천 3열. */
  layout?: 'fixed' | 'grid';
  /** GA4 `product_card_click` 진입 경로(web 카드 `source`). 없으면 추적 안 함. */
  trackingSource?: ProductCardSource;
}) {
  const now = useNowMinute();
  const {hasWon, priceWithoutWon} = parsePrice(product.price);
  const priceText = hasWon ? `${priceWithoutWon}원` : priceWithoutWon;
  const isGrid = layout === 'grid';

  return (
    <PressableScale
      style={isGrid ? {width: '100%'} : {width: CARD_WIDTH}}
      onPressIn={() =>
        prefetchProductDetail(
          Number(product.id),
          product.thumbnail,
          product.title,
        )
      }
      onPress={() => {
        trackProductCardClick(trackingSource, product.id);
        onPress(Number(product.id));
      }}
      accessibilityRole="button"
      accessibilityLabel={product.title}>
      <View>
        <View
          className={cardThumb}
          style={
            isGrid
              ? {width: '100%', aspectRatio: 1}
              : {width: CARD_WIDTH, height: CARD_WIDTH}
          }>
          <Thumbnail
            uri={product.thumbnail}
            categoryId={product.categoryId}
            type="hotDeal"
          />

          <ProductCardStatus product={product} />
        </View>

        {/* 제목은 2줄 고정 — 높이를 안 잡으면 아래 가격 줄이 카드마다 어긋난다. */}
        <Text
          className={productCard.title}
          // pt-2(8) + 2줄(20×2). HomeCardPrimitives CardTitle 과 같은 값.
          style={{height: 48}}
          numberOfLines={2}>
          {product.title}
        </Text>
        <DisplayProductSource
          mallName={product.mallName}
          providerName={product.provider?.nameKr}
          postedCommunityCount={product.postedCommunityCount}
          time={
            product.postedAt ? displayTime(product.postedAt, now) : undefined
          }
        />
        {/* 그리드(3열)는 16px — web ProductGridCard 와 같다. 캐러셀(120px)은 18px. */}
        <Text
          className={cn(
            'pt-1',
            isGrid ? productCard.price.grid : productCard.price.list,
          )}
          numberOfLines={1}>
          {priceText}
        </Text>
      </View>
    </PressableScale>
  );
});

export default ProductCard;
