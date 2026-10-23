import {addChip, text} from '@jirum/design-system/recipes';
import {
  describeKeywordActivity,
  KEYWORD_BOARD_COPY,
} from '@jirum/domain/keyword-board';
import {broadenSuggestion} from '@jirum/domain/keyword-frequency';
import {relativeTimeLabel} from '@jirum/domain/relative-time';
import React from 'react';
import {Pressable, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import {SkeletonBox} from '@/shared/components/Skeletons';
import {Text} from '@/shared/components/ui/Text/AppText';
import {cn} from '@/shared/lib/styling';

import type {KeywordBoardItem} from '../model/useKeywordBoard';
import KeywordDealRow from './KeywordDealRow';

type HubLink = {slug: string; name: string};

/** KeywordDealRow 의 사진 자리(76) — 눈금 이름이 없는 크기라 style 로. */
const THUMB_SKELETON = {width: 76, height: 76, borderRadius: 8};

/**
 * 내 키워드 카드 한 장 — «이 키워드가 지금 어떤가»: 살아 있는 정도(오늘·이번 주 N건·조용함) + 알림이 잡았을 최근 딜 3건 +
 * 허브면 30일 모음, 아니면 검색으로. 90일 동안 드물면 그 자리에서 넓혀 받기(내 키워드 화면의 제안과 같은 규칙).
 * item 이 없으면(상황판 조회 전·실패) 이름과 길만 그린다. web widgets/keyword-board/ui/KeywordBoardCard 와 짝.
 */
export default function KeywordBoardCard({
  keyword,
  item,
  pending,
  hub,
  onOpenHub,
  onOpenSearch,
  onOpenProduct,
  onBroaden,
  broadening = false,
  now,
}: {
  keyword: string;
  item: KeywordBoardItem | null;
  pending: boolean;
  hub?: HubLink;
  onOpenHub: (hub: HubLink) => void;
  onOpenSearch: (keyword: string) => void;
  onOpenProduct: (id: number) => void;
  onBroaden?: (keyword: string) => void;
  broadening?: boolean;
  now: number;
}) {
  const activity = item
    ? describeKeywordActivity(
        item,
        relativeTimeLabel(item.lastDealAt, now),
        now,
      )
    : null;
  // 생성 타입은 칸이 optional 이라 null 로 맞춘다(web 수기 문서는 처음부터 null).
  const suggestion =
    item && onBroaden
      ? broadenSuggestion({
          dealCount: item.dealCount,
          suggestedKeyword: item.suggestedKeyword ?? null,
          suggestedDealCount: item.suggestedDealCount ?? null,
        })
      : null;

  return (
    <View className="rounded-xl border border-gray-200 px-4 py-3">
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 shrink">
          <Text className={text.subtitle} numberOfLines={1}>
            {keyword}
          </Text>
          {activity ? (
            <Text
              className={cn(
                'mt-0.5',
                text.caption,
                activity.tone === 'today' && 'font-semibold text-error-600',
              )}>
              {activity.text}
            </Text>
          ) : pending ? (
            <SkeletonBox className="mt-1 h-3 w-32 rounded" />
          ) : null}
        </View>
        {/* 배치는 바깥 View 가 — Pressable 엔 누름 opacity 만(className 과 함수형 style 을 같이 주면 NativeWind 가 떨군다). */}
        <Pressable
          onPress={() => (hub ? onOpenHub(hub) : onOpenSearch(keyword))}
          hitSlop={8}
          accessibilityRole="link"
          accessibilityLabel={
            hub ? `${keyword} 핫딜 모아보기` : `${keyword} 검색`
          }
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <Text className={text.caption}>
            {`${hub ? KEYWORD_BOARD_COPY.hub : KEYWORD_BOARD_COPY.search} ›`}
          </Text>
        </Pressable>
      </View>

      {item && item.recentDeals.length > 0 ? (
        <View className="mt-1">
          {item.recentDeals.map((deal, i) => (
            <View
              key={deal.id}
              className={i > 0 ? 'border-t border-gray-100' : undefined}>
              <KeywordDealRow deal={deal} now={now} onPress={onOpenProduct} />
            </View>
          ))}
        </View>
      ) : pending ? (
        <View className="mt-2 flex-row items-center gap-3 py-2">
          <SkeletonBox style={THUMB_SKELETON} />
          <View className="flex-1 gap-2">
            <SkeletonBox className="h-3.5 w-11/12 rounded" />
            <SkeletonBox className="h-3.5 w-1/3 rounded" />
          </View>
        </View>
      ) : null}

      {suggestion && onBroaden ? (
        // 드문 키워드(90일 3번 미만) — 첫 낱말(대개 브랜드)로 넓혀 받기. 원래 키워드는 그대로.
        <View className="mt-2 flex-row flex-wrap items-center gap-2">
          <Text className={text.caption}>{suggestion.text}</Text>
          <PressableScale
            disabled={broadening}
            onPress={() => onBroaden(suggestion.keyword)}
            accessibilityRole="button"
            accessibilityLabel={suggestion.button}
            className={cn('flex-row items-center gap-1.5', addChip.box)}>
            <Text className={addChip.text}>{suggestion.button}</Text>
            <Text className={addChip.plus}>+</Text>
          </PressableScale>
        </View>
      ) : null}
    </View>
  );
}
