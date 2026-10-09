import React from 'react';
import {useColorScheme, View} from 'react-native';
import {cardThumb} from '@jirum/design-system/recipes';
import {Image} from 'expo-image';
import {Text} from '@/shared/components/ui/Text/AppText';

import PressableScale from '@/shared/components/PressableScale';
import {cn} from '@/shared/lib/styling';
import NoImage from '@/shared/components/product/NoImage';
import {DARK_IMAGE_STYLE} from '@/shared/components/product/Thumbnail';

import type {TossDeal} from '../../lib/toss';
import Badge from '@/shared/components/ui/Badge';
import {CardCornerLabel} from '@/shared/components/product/ProductCardStatus';

/**
 * 토스 전용 카드. web TossDealCard.
 * 코너에서는 판매가·할인율을 숨긴다. 상세 경로는 호출측이 ?from=toss 를 붙인다.
 */
export default function TossDealCard({
  deal,
  onPress,
}: {
  deal: TossDeal;
  onPress: (id: number) => void;
}) {
  const label = deal.badge;
  const isDark = useColorScheme() === 'dark';

  return (
    <PressableScale
      disabled={!deal.productId}
      onPress={() => deal.productId && onPress(deal.productId)}
      accessibilityRole="button"
      accessibilityLabel={deal.title}
      style={{width: '100%'}}>
      <View className={cn('w-full', cardThumb)} style={{aspectRatio: 1}}>
        {deal.image ? (
          <Image
            source={{uri: deal.image}}
            style={[
              {width: '100%', height: '100%'},
              isDark && DARK_IMAGE_STYLE,
            ]}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={120}
            recyclingKey={deal.image}
          />
        ) : (
          <NoImage categoryId={null} type="product" />
        )}
        {label ? (
          <View className="bg-error-500 absolute top-0 right-0 z-10 h-6 items-center justify-center rounded-tr-lg rounded-bl-lg px-2">
            <Text className="text-xs font-semibold text-fixed-white">
              {label}
            </Text>
          </View>
        ) : null}
        {deal.bestSeller ? (
          <CardCornerLabel tone="dark">베스트판매자</CardCornerLabel>
        ) : null}
      </View>

      <View>
        <Text
          className="pt-2 text-sm text-gray-700"
          style={{height: 48}}
          numberOfLines={2}>
          {deal.title}
        </Text>

        {deal.arrivalGuaranteed || deal.specialProduct ? (
          <View className="flex-row flex-wrap gap-1 pt-1">
            {deal.arrivalGuaranteed ? (
              <Badge tone="success">도착보장</Badge>
            ) : null}
            {deal.specialProduct ? <Badge tone="error">토스특가</Badge> : null}
          </View>
        ) : null}

        <View className="flex-row flex-wrap items-center gap-x-1.5 pt-1">
          {typeof deal.rating === 'number' ? (
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              <Text className="text-warning-400">★</Text> {deal.rating}
              {deal.reviewCount
                ? ` (${deal.reviewCount.toLocaleString()})`
                : ''}
            </Text>
          ) : null}
          {deal.delivery ? (
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              · {deal.delivery}
            </Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}
