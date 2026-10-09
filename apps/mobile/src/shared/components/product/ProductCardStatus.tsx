import React from 'react';
import {View} from 'react-native';
import {cardLabel} from '@jirum/design-system/recipes';
import HotdealBadge from '@/shared/components/product/HotdealBadge';
import {Text} from '@/shared/components/ui/Text/AppText';
import {formatMMD} from '@/shared/lib/format/date';
import {cn} from '@/shared/lib/styling';
import type {HotDealType} from '@/shared/api/gql/graphql';

/** 사진 왼쪽 아래 모서리 라벨(판매종료·베스트판매자). light = 흰 면, dark = 사진 위 어두운 면. */
export function CardCornerLabel({
  tone,
  children,
}: {
  tone: keyof typeof cardLabel.tone;
  children: React.ReactNode;
}) {
  return (
    <View
      className={cn(
        'absolute bottom-0 left-0 z-10 justify-center',
        cardLabel.corner.box,
        cardLabel.tone[tone].box,
      )}>
      <Text className={cn(cardLabel.corner.text, cardLabel.tone[tone].text)}>
        {children}
      </Text>
    </View>
  );
}

/**
 * 상품 카드 사진 위 상태 — 판매종료 / 핫딜 배지 / 유통기한 띠. 홈 카드·검색 카드가 같이 쓴다.
 * ★같은 상품을 홈·검색·상세를 오가며 다시 보므로 카드마다 다르게 그리면 버그로 읽힌다 — 여기서만 그린다.
 * 유통기한 띠(22px)가 있으면 핫딜 배지(24px)는 숨긴다 — 같은 자리라 띠가 배지를 덮고 윗변 2px 만 삐져나왔다.
 * 모양은 recipes 의 cardLabel — web ProductCardStatus 와 같다.
 */
export default function ProductCardStatus({
  product,
  showHotdealBadge = true,
}: {
  product: {
    isEnd?: boolean | null;
    hotDealType?: HotDealType | string | null;
    earliestExpiryDate?: string | null;
  };
  showHotdealBadge?: boolean;
}) {
  const {isEnd, hotDealType, earliestExpiryDate} = product;
  return (
    <>
      {isEnd ? (
        <CardCornerLabel tone="light">판매종료</CardCornerLabel>
      ) : showHotdealBadge && hotDealType && !earliestExpiryDate ? (
        <View className="absolute bottom-0 left-0">
          <HotdealBadge
            hotdealType={hotDealType as HotDealType}
            badgeVariant="card"
          />
        </View>
      ) : null}
      {earliestExpiryDate && !isEnd ? (
        <View
          className={cn(
            'absolute inset-x-0 bottom-0 items-center justify-center',
            cardLabel.strip.box,
          )}>
          <Text className={cardLabel.strip.text}>
            유통기한 {formatMMD(earliestExpiryDate)}
          </Text>
        </View>
      ) : null}
    </>
  );
}
