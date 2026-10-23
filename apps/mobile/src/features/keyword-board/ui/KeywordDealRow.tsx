import {text} from '@jirum/design-system/recipes';
import {relativeTimeLabel} from '@jirum/domain/relative-time';
import React from 'react';
import {View} from 'react-native';

import {
  CardThumbnail,
  DisplayListPrice,
} from '@/entities/home/ui/cards/HomeCardPrimitives';
import {prefetchProductDetail} from '@/entities/product/prefetch-detail';
import PressableScale from '@/shared/components/PressableScale';
import {Text} from '@/shared/components/ui/Text/AppText';
import {trackProductCardClick} from '@/shared/lib/analytics/card-tracking';
import {cn} from '@/shared/lib/styling';

import type {KeywordBoardDeal} from '../model/useKeywordBoard';

/** 목록 카드(ListCard)와 같은 76 — 64 에선 「평소보다 12%↓」 배지가 잘렸다(하네스 10/23). */
const THUMB = {width: 76, height: 76};

/**
 * 키워드 카드 안 최근 딜 한 줄 — 목록 카드(ListCard)와 같은 76px 사진. 1년 최저가·기준가 대비·판매종료 표시는
 * CardThumbnail 안 ProductCardStatus 한 곳. web widgets/keyword-board/ui/KeywordDealRow 와 짝.
 */
export default function KeywordDealRow({
  deal,
  now,
  onPress,
}: {
  deal: KeywordBoardDeal;
  now: number;
  onPress: (id: number) => void;
}) {
  return (
    <PressableScale
      onPressIn={() =>
        prefetchProductDetail(Number(deal.id), deal.thumbnail, deal.title)
      }
      onPress={() => {
        trackProductCardClick('keyword_tab', deal.id);
        onPress(Number(deal.id));
      }}
      accessibilityRole="button"
      accessibilityLabel={deal.title}
      // ★className 은 PressableScale 안쪽 View 가 받는다(ListCard 와 같다).
      className="flex-row items-center gap-3 py-2">
      <>
        <CardThumbnail
          product={deal}
          style={THUMB}
          showHotdealBadge={false}
          compact
        />
        <View className="min-w-0 flex-1">
          <Text
            className={cn(text.body, deal.isEnd && 'text-gray-500')}
            numberOfLines={2}>
            {deal.title}
          </Text>
          <View className="mt-1 flex-row items-center gap-2">
            <DisplayListPrice price={deal.price} />
            <Text className={text.caption}>
              {relativeTimeLabel(deal.postedAt, now)}
            </Text>
          </View>
        </View>
      </>
    </PressableScale>
  );
}
