import React from 'react';
import {Image, Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import NoImage from '@/shared/components/product/NoImage';
import {cn} from '@/shared/lib/styling';

import type {TossDeal} from '../../lib/toss';

/**
 * 토스 전용 카드. web TossDealCard.
 * 3열이라 카드폭이 좁다 — web 이 겪은 줄바꿈 버그(가격의 '원'까지 쪼개짐)는
 * RN 에선 numberOfLines 로 방지된다.
 */
export default function TossDealCard({
  deal,
  onPress,
}: {
  deal: TossDeal;
  onPress: (id: number) => void;
}) {
  const label =
    deal.badge ??
    (deal.discountRate ? `${deal.discountRate}% 특가` : undefined);

  return (
    <PressableScale
      disabled={!deal.productId}
      onPress={() => deal.productId && onPress(deal.productId)}
      accessibilityRole="button"
      accessibilityLabel={deal.title}
      style={{width: '100%'}}>
      <View
        className="w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50"
        style={{aspectRatio: 1}}>
        {deal.image ? (
          <Image
            source={{uri: deal.image}}
            style={{width: '100%', height: '100%'}}
            resizeMode="cover"
          />
        ) : (
          <NoImage categoryId={null} type="product" />
        )}
        {label ? (
          <View className="bg-error-500 absolute top-0 right-0 z-10 h-6 items-center justify-center rounded-tr-lg rounded-bl-lg px-2">
            <Text className="text-xs font-semibold text-white">{label}</Text>
          </View>
        ) : null}
        {deal.bestSeller ? (
          <View className="absolute bottom-0 left-0 z-10 h-[22px] justify-center rounded-tr-lg rounded-bl-lg bg-gray-900/80 px-2">
            <Text className="text-xs font-medium text-white">베스트판매자</Text>
          </View>
        ) : null}
      </View>

      <View>
        <Text
          className="pt-2 text-sm text-gray-700"
          style={{height: 48}}
          numberOfLines={2}>
          {deal.title}
        </Text>

        <View className="flex-row flex-wrap items-baseline gap-x-1.5 pt-1">
          <Text
            className="text-lg font-semibold text-gray-900"
            numberOfLines={1}>
            {deal.price.toLocaleString()}원
          </Text>
          {deal.lowestIn30Days ? (
            <Text className="text-error-500 text-xs font-bold">
              30일 최저가
            </Text>
          ) : null}
        </View>

        {deal.lowestPriceCompensation ||
        deal.arrivalGuaranteed ||
        deal.specialProduct ? (
          <View className="flex-row flex-wrap gap-1 pt-1">
            {deal.lowestPriceCompensation ? (
              <Badge className="bg-blue-50" textClassName="text-blue-600">
                최저가 보상
              </Badge>
            ) : null}
            {deal.arrivalGuaranteed ? (
              <Badge className="bg-green-50" textClassName="text-green-600">
                도착보장
              </Badge>
            ) : null}
            {deal.specialProduct ? (
              <Badge className="bg-error-50" textClassName="text-error-600">
                토스특가
              </Badge>
            ) : null}
          </View>
        ) : null}

        {deal.unitPrice ? (
          <Text className="text-xs text-gray-500" numberOfLines={1}>
            {deal.unitPrice}
          </Text>
        ) : null}

        <View className="flex-row flex-wrap items-center gap-x-1.5 pt-1">
          {typeof deal.rating === 'number' ? (
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              <Text className="text-[#ffb200]">★</Text> {deal.rating}
              {deal.reviewCount
                ? ` (${deal.reviewCount.toLocaleString()})`
                : ''}
            </Text>
          ) : null}
          {deal.delivery ? (
            <Text className="text-xs text-gray-400" numberOfLines={1}>
              · {deal.delivery}
            </Text>
          ) : null}
        </View>
      </View>
    </PressableScale>
  );
}

function Badge({
  children,
  className,
  textClassName,
}: {
  children: string;
  className: string;
  textClassName: string;
}) {
  return (
    <View className={cn('rounded px-1.5 py-0.5', className)}>
      {/* web `whitespace-nowrap` — 3열 좁은 카드에서 "최저가 보상"이 쪼개지지 않게. */}
      <Text
        className={cn('text-[11px] font-medium', textClassName)}
        numberOfLines={1}>
        {children}
      </Text>
    </View>
  );
}
