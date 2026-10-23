import {button, infoBox, text} from '@jirum/design-system/recipes';
import {
  KEYWORD_BOARD_COPY,
  keywordBoardHeadline,
  sortKeywordBoard,
  summarizeKeywordBoard,
} from '@jirum/domain/keyword-board';
import React from 'react';
import {Pressable, View} from 'react-native';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';

import {findKeywordHubForQuery} from '@/entities/keyword-hub/lib/keyword-hub';
import {MyPageQueries} from '@/entities/mypage';
import {
  invalidateMyKeywords,
  normalizeKeyword,
} from '@/entities/mypage/model/myKeywords';
import {MyPageService} from '@/shared/api/mypage';
import PressableScale from '@/shared/components/PressableScale';
import {SkeletonBox} from '@/shared/components/Skeletons';
import {Text} from '@/shared/components/ui/Text/AppText';
import {trackKeywordRegister} from '@/shared/lib/analytics/keyword-tracking';
import {requestPushPermissionIfNeeded} from '@/shared/lib/fcm/push-permission';
import {usePushPermissionStatus} from '@/shared/lib/fcm/usePushPermissionStatus';
import {showToast} from '@/shared/lib/feedback';
import {cn} from '@/shared/lib/styling';

import {useKeywordBoard, type KeywordBoardItem} from '../model/useKeywordBoard';
import KeywordBoardCard from './KeywordBoardCard';
import RecommendedKeywordChips from './RecommendedKeywordChips';

type HubLink = {slug: string; name: string; aliases?: string[] | null};

/**
 * 키워드 탭 맨 위 «내 키워드 상황판» — 2026-10-23 칩 목록을 카드로 바꿨다. 키워드는 «무엇을 기다리나»의 단위라,
 * 이 탭이 «기다리는 것들이 지금 어떤가»(이번 주 올라온 딜·지금 사기 좋은 딜·키워드별 최근 딜)에 답하게 한다.
 * 푸시를 못 받는 등록자(10/21 실측 74%)에게는 이 상황판이 알림의 전부다. 규칙·문구는 @jirum/domain/keyword-board 한 곳,
 * 숫자는 서버 keywordDealFrequencies(알림과 같은 매칭). web widgets/keyword-board/ui/KeywordBoard 와 짝.
 * 앱은 첫 실행에 게스트 계정이 생겨서 누구나 내 키워드를 읽을 수 있다.
 */
export default function KeywordBoard({
  hubs,
  onOpenHub,
  onOpenSearch,
  onOpenProduct,
  onRegister,
}: {
  hubs: HubLink[];
  onOpenHub: (hub: HubLink) => void;
  onOpenSearch: (keyword: string) => void;
  onOpenProduct: (id: number) => void;
  /** 내 키워드 화면(입력칸·조건)으로. */
  onRegister: () => void;
}) {
  const queryClient = useQueryClient();
  const {data: keywords, isPending} = useQuery(MyPageQueries.keywords());
  const names = (keywords ?? []).map(k => k.keyword);
  const board = useKeywordBoard(names);
  const push = usePushPermissionStatus();
  const {mutate: broaden, isPending: broadening} = useMutation({
    mutationFn: (keyword: string) => MyPageService.addKeyword({keyword}),
    onSuccess: (_data, keyword) => {
      trackKeywordRegister('mypage_broaden', keyword);
      showToast.success(`'${keyword}' 키워드 알림도 등록했어요.`);
      requestPushPermissionIfNeeded();
      return invalidateMyKeywords(queryClient);
    },
    onError: (error: unknown) =>
      showToast.error(
        (error instanceof Error && error.message) ||
          '키워드를 저장하지 못했어요.',
      ),
  });

  // 받는 중엔 비워 둔다 — 「키워드를 걸어 보세요」가 깜빡였다 사라지면 더 거슬린다.
  if (isPending) return <View className="h-20" />;

  const registered = new Set(names.map(normalizeKeyword));

  if (!keywords?.length) {
    return (
      <View className="mx-5 rounded-xl bg-gray-50 px-4 py-4">
        <Text className={text.label}>{KEYWORD_BOARD_COPY.emptyTitle}</Text>
        <Text className={cn('mb-4 mt-1', text.caption)}>
          {KEYWORD_BOARD_COPY.emptyBody}
        </Text>
        <RecommendedKeywordChips
          registered={registered}
          onRegister={onRegister}
        />
      </View>
    );
  }

  // 「N시간 전」의 기준 시각 — 렌더마다 한 번(당겨서 새로 받으면 다시 그려진다).
  const now = Date.now();
  const byKeyword = new Map<string, KeywordBoardItem>(
    (board.data ?? []).map(item => [normalizeKeyword(item.keyword), item]),
  );
  const items = board.data ? sortKeywordBoard(board.data) : null;
  // 상황판 순서(최근 딜 순)로 내 키워드를 늘어놓고, 상황판에 없는 키워드(조회 실패·초과)는 등록 순으로 뒤에.
  const ordered = items
    ? [
        ...items
          .map(item =>
            keywords.find(
              k =>
                normalizeKeyword(k.keyword) === normalizeKeyword(item.keyword),
            ),
          )
          .filter((k): k is (typeof keywords)[number] => !!k),
        ...keywords.filter(k => !byKeyword.has(normalizeKeyword(k.keyword))),
      ]
    : keywords;
  const headline = items
    ? keywordBoardHeadline(summarizeKeywordBoard(items))
    : null;

  return (
    <View className="px-5">
      <View className="mb-3 flex-row items-baseline justify-between">
        <Text className={text.subtitle}>{KEYWORD_BOARD_COPY.mineTitle}</Text>
        <Pressable
          onPress={onRegister}
          hitSlop={8}
          accessibilityRole="button"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <Text
            className={text.caption}>{`${KEYWORD_BOARD_COPY.manage} ›`}</Text>
        </Pressable>
      </View>

      {headline ? (
        <View className={cn('mb-3 px-4 py-3', infoBox)}>
          <Text className={text.label}>{headline.title}</Text>
          <Text className={cn('mt-0.5', text.caption)}>
            {headline.description}
          </Text>
        </View>
      ) : board.isPending ? (
        <SkeletonBox className="mb-3 h-16 w-full rounded-xl" />
      ) : null}

      {/* 권한이 꺼져 있으면 머리말 바로 아래 — 키워드를 걸어도 알림이 안 온다(알림 탭의 띠와 같은 문구·버튼). 머리말(서비스의 답)이 먼저다. */}
      {push.granted === false ? (
        <View className="mb-3 flex-row items-center justify-between gap-3 rounded-lg bg-gray-50 px-4 py-3">
          <Text className="shrink text-sm font-medium text-gray-700">
            알림이 꺼져 있어 핫딜을 못 받고 있어요
          </Text>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel="알림 켜기"
            hitSlop={6}
            className={cn(
              'justify-center',
              button.size.xs.box,
              button.tone.dark.box,
            )}
            onPress={push.enable}>
            <Text className={cn(button.size.xs.text, button.tone.dark.text)}>
              켜기
            </Text>
          </PressableScale>
        </View>
      ) : null}

      <View className="gap-3">
        {ordered.map(({id, keyword}) => {
          const hub = findKeywordHubForQuery(keyword, hubs);
          const item = byKeyword.get(normalizeKeyword(keyword)) ?? null;
          const suggested = item?.suggestedKeyword;
          return (
            <KeywordBoardCard
              key={id}
              keyword={keyword}
              item={item}
              pending={board.isPending}
              hub={hub}
              onOpenHub={onOpenHub}
              onOpenSearch={onOpenSearch}
              onOpenProduct={onOpenProduct}
              // 제안 키워드를 이미 갖고 있으면 넓히기를 안 띄운다(등록하면 「이미 등록된 키워드」).
              onBroaden={
                suggested && !registered.has(normalizeKeyword(suggested))
                  ? next => broaden(next)
                  : undefined
              }
              broadening={broadening}
              now={now}
            />
          );
        })}
      </View>

      <View className="mt-5">
        <RecommendedKeywordChips
          registered={registered}
          onRegister={onRegister}
        />
      </View>
    </View>
  );
}
