import {pageHeader, text as textRole} from '@jirum/design-system/recipes';
import {
  isKeywordHubToday,
  splitKeywordHubsByRecency,
} from '@jirum/domain/keyword-hub';
import {relativeTimeLabel} from '@jirum/domain/relative-time';
import React, {useCallback, useRef} from 'react';
import {
  Pressable,
  RefreshControl,
  SectionList,
  StyleSheet,
  View,
} from 'react-native';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';

import {
  buildKeywordHubFacts,
  formatHubCount,
  KEYWORD_HUB_WINDOW_DAYS,
} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHubs} from '@/entities/keyword-hub/model/useKeywordHubs';
import KeywordBoard from '@/features/keyword-board/ui/KeywordBoard';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';
import {useRegisterScrollToTop} from '@/navigations/tab/scroll-to-top-store';
import Badge from '@/shared/components/ui/Badge';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {ListRowsSkeleton} from '@/shared/components/Skeletons';
import {Text} from '@/shared/components/ui/Text/AppText';
import SearchIcon from '@/shared/components/icons/search';
import {
  searchStackNavigations,
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import {Analytics} from '@/shared/lib/analytics/ga4';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
import {cn} from '@/shared/lib/styling';
import {useColors} from '@/shared/theme/useColors';
import type {KeywordHubsQuery} from '@/shared/api/gql/graphql';

type Nav = NativeStackNavigationProp<TabStackParamList>;
type Hub = KeywordHubsQuery['keywordHubs'][number];
type HubSection = {
  key: string;
  title: string;
  description: string;
  data: Hub[];
};

/**
 * 키워드 탭 루트 — web `/keywords`(키워드별 핫딜 모음) 대응. 2026-10-20 하단 탭 커뮤니티 자리를 넘겨받았다
 * (커뮤니티 탭을 쓰는 앱 사용자는 드물었다). 키워드는 알림을 거는 단위라, 둘러보다 그 자리에서 알림으로 이어지게 탭으로 올렸다.
 *
 * 순서: 내 키워드 상황판(features/keyword-board — 이번 주 올라온 딜·지금 사기 좋은 딜·키워드별 최근 딜, 2026-10-23)
 * → 최근 핫딜이 올라온 키워드 → 핫딜을 기다리는 키워드. 나눔 규칙은 @jirum/domain(web 과 같은 사흘 창).
 * ★web 맨 위의 「지금 사기 좋아요」(모델 페이지 판정 카드)는 옮기지 않는다 — 모델 페이지(/deals)는 앱에서 열지 않는다
 * (2026-09-09 사용자 지시, tab-routing). PC 폭 SEO 링크(「상품별 최저가 전체 목록」)도 같은 이유로 뺀다.
 */
export default function KeywordsTabScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const {data: hubs, isPending, isError, refetch} = useKeywordHubs();
  const {refreshing, onRefresh} = usePullRefresh(refetch);

  const listRef = useRef<SectionList<Hub, HubSection>>(null);
  const scrollToTop = useCallback(() => {
    listRef.current?.getScrollResponder()?.scrollTo({y: 0, animated: true});
  }, []);
  useRegisterScrollToTop(tabNavigations.KEYWORDS, scrollToTop);

  const openHub = useCallback(
    (hub: {slug: string; name: string}, placement: string) => {
      Analytics.track('keyword_hub_card_click', {keyword: hub.slug, placement});
      navigation.push(tabStackNavigations.KEYWORD_HUB, {
        slug: hub.slug,
        name: hub.name,
      });
    },
    [navigation],
  );
  // 루트 스택의 Search 는 검색 스택(중첩)이라 검색어는 자식 화면 params 로 넣어야 닿는다(내 키워드 화면과 같은 모양).
  const openSearch = useCallback(
    (keyword: string) =>
      (navigation.push as (name: string, params?: object) => void)(
        tabStackNavigations.SEARCH,
        {screen: searchStackNavigations.HOME, params: {keyword}},
      ),
    [navigation],
  );
  const openProduct = useCallback(
    (id: number) =>
      navigation.push(tabStackNavigations.DETAIL, {path: `/products/${id}`}),
    [navigation],
  );
  const openKeywordSettings = useCallback(
    () => navigation.push(tabStackNavigations.MYPAGE_KEYWORD),
    [navigation],
  );

  // 「사흘 안」·「N시간 전」의 기준 시각. 당겨서 새로 받으면 다시 그려진다.
  const now = Date.now();
  const {live, quiet} = splitKeywordHubsByRecency(hubs ?? [], now);
  const sections: HubSection[] = [
    {
      key: 'live',
      title: '최근 핫딜이 올라온 키워드',
      description: `사흘 안에 핫딜이 올라왔어요. 최근 ${KEYWORD_HUB_WINDOW_DAYS}일 동안 많이 올라온 순서예요.`,
      data: live,
    },
    {
      key: 'quiet',
      title: '핫딜을 기다리는 키워드',
      description:
        '한동안 핫딜이 없었어요. 알림을 걸어 두면 다음 딜을 놓치지 않아요.',
      data: quiet,
    },
  ].filter(s => s.data.length > 0);

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      {/* 보일 때만 — 시작 2초 뒤 미리 그려질 때 홈의 상태바(흰 글자)를 덮지 않게(HomeStatusBar 참고). */}
      {isFocused ? <SystemBars style="auto" hidden={false} /> : null}

      {/* 헤더 — web KeywordsTabHeader(제목 + 검색) */}
      <View
        className={cn(
          'flex-row items-center justify-between',
          pageHeader.bar,
          pageHeader.height,
          pageHeader.border,
        )}>
        <Text className={pageHeader.title}>키워드</Text>
        <Pressable
          onPress={() => navigation.push(tabStackNavigations.SEARCH)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="검색"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <SearchIcon width={24} height={24} color={c.gray[900]} />
        </Pressable>
      </View>

      {isError && !hubs ? (
        <View className="pt-4">
          <SectionErrorRow label="키워드" onRetry={refetch} />
        </View>
      ) : isPending ? (
        <ListRowsSkeleton count={8} thumbnailSize={0} />
      ) : (
        <SectionList
          ref={listRef}
          sections={sections}
          keyExtractor={hub => hub.slug}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={c.gray[500]}
            />
          }
          contentContainerStyle={[
            styles.content,
            {paddingBottom: getReservedBottomPx(insets.bottom) + 24},
          ]}
          ListHeaderComponent={
            <KeywordBoard
              hubs={hubs ?? []}
              onOpenHub={hub => openHub(hub, 'keyword_tab_mine')}
              onOpenSearch={openSearch}
              onOpenProduct={openProduct}
              onRegister={openKeywordSettings}
            />
          }
          renderSectionHeader={({section}) => (
            <View className="px-5 pb-3 pt-6">
              <Text className={textRole.subtitle}>{section.title}</Text>
              <Text className={cn('mt-1', textRole.caption)}>
                {section.description}
              </Text>
            </View>
          )}
          renderItem={({item}) => (
            <HubRow
              hub={item}
              now={now}
              onPress={() => openHub(item, 'keyword_tab')}
            />
          )}
        />
      )}
    </View>
  );
}

/** 키워드 한 칸 — web KeywordHubCards 와 같은 내용(이름 · 마지막 딜 · 「최근 30일 N건 · 30일 중 M일 · 주로 X」). 가격은 쓰지 않는다. */
function HubRow({
  hub,
  now,
  onPress,
}: {
  hub: Hub;
  now: number;
  onPress: () => void;
}) {
  const facts = [
    hub.recentDealCount > 0
      ? `최근 ${KEYWORD_HUB_WINDOW_DAYS}일 ${formatHubCount(hub)}`
      : null,
    ...buildKeywordHubFacts(hub),
  ]
    .filter(Boolean)
    .join(' · ');
  const lastLabel = relativeTimeLabel(hub.lastDealAt, now);

  return (
    <View className="px-5 pb-2">
      {/* ★Pressable 엔 opacity 만 — 모양은 안쪽 View(함수형 style 에 레이아웃을 주면 NativeWind 가 떨군다). */}
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`${hub.name} 핫딜`}
        style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
        <View className="gap-1 rounded-lg border border-gray-100 px-4 py-3">
          <View className="flex-row items-center justify-between gap-2">
            <Text className={cn('shrink', textRole.subtitle)} numberOfLines={1}>
              {hub.name} 핫딜
            </Text>
            {hub.lastDealAt && lastLabel ? (
              <Badge
                pill
                tone={
                  isKeywordHubToday(hub.lastDealAt, now) ? 'error' : 'gray'
                }>
                {lastLabel}
              </Badge>
            ) : null}
          </View>
          {facts ? (
            <Text className={textRole.caption} numberOfLines={1}>
              {facts}
            </Text>
          ) : null}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {paddingTop: 20},
});
