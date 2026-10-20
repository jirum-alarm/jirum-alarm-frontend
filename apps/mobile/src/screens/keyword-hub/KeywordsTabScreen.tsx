import {
  linkChip,
  pageHeader,
  text as textRole,
} from '@jirum/design-system/recipes';
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
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useQuery} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';

import {MyPageQueries} from '@/entities/mypage';
import {
  buildKeywordHubFacts,
  findKeywordHubForQuery,
  formatHubCount,
  KEYWORD_HUB_WINDOW_DAYS,
} from '@/entities/keyword-hub/lib/keyword-hub';
import {useKeywordHubs} from '@/entities/keyword-hub/model/useKeywordHubs';
import {getReservedBottomPx} from '@/navigations/tab/tab-bar-metrics';
import {useRegisterScrollToTop} from '@/navigations/tab/scroll-to-top-store';
import Badge from '@/shared/components/ui/Badge';
import Button from '@/shared/components/ui/Button';
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
import {cn, splitBoxText} from '@/shared/lib/styling';
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

/** web 한 줄 레시피를 겉(View)·글자(Text)로 — 내 키워드 칩. */
const mineChip = splitBoxText(linkChip);

/**
 * 키워드 탭 루트 — web `/keywords`(키워드별 핫딜 모음) 대응. 2026-10-20 하단 탭 커뮤니티 자리를 넘겨받았다
 * (커뮤니티 탭을 쓰는 앱 사용자는 드물었다). 키워드는 알림을 거는 단위라, 둘러보다 그 자리에서 알림으로 이어지게 탭으로 올렸다.
 *
 * 순서: 내 키워드(허브면 30일 모음, 아니면 검색) → 최근 핫딜이 올라온 키워드 → 핫딜을 기다리는 키워드. 나눔 규칙은
 * @jirum/domain(web 과 같은 사흘 창).
 * ★web 맨 위의 「지금 사기 좋아요」(모델 페이지 판정 카드)는 옮기지 않는다 — 모델 페이지(/deals)는 앱에서 열지 않는다
 * (2026-09-09 사용자 지시, tab-routing). PC 폭 SEO 링크(「상품별 최저가 전체 목록」)도 같은 이유로 뺀다.
 */
export default function KeywordsTabScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
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
      <SystemBars style="auto" hidden={false} />

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
            <MyKeywords
              hubs={hubs ?? []}
              onOpenHub={hub => openHub(hub, 'keyword_tab_mine')}
              onOpenSearch={keyword =>
                (navigation.push as (name: string, params?: object) => void)(
                  tabStackNavigations.SEARCH,
                  {screen: searchStackNavigations.HOME, params: {keyword}},
                )
              }
              onRegister={() =>
                navigation.push(tabStackNavigations.MYPAGE_KEYWORD)
              }
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

/**
 * 내가 알림을 건 키워드 — web MyKeywordsSection 과 짝. 허브인 키워드는 30일 모음으로, 아니면 지금 올라온 딜 검색으로
 * (내 키워드 화면의 「핫딜 모아보기」·「지금 올라온 딜 보기」와 같은 갈림). 없으면 등록으로 이끄는 한 줄.
 * 앱은 첫 실행에 게스트 계정이 생겨서 누구나 내 키워드를 읽을 수 있다.
 */
function MyKeywords({
  hubs,
  onOpenHub,
  onOpenSearch,
  onRegister,
}: {
  hubs: Hub[];
  onOpenHub: (hub: Hub) => void;
  onOpenSearch: (keyword: string) => void;
  onRegister: () => void;
}) {
  const {data: keywords, isPending} = useQuery(MyPageQueries.keywords());

  // 받는 중엔 비워 둔다 — 「키워드를 걸어 보세요」가 깜빡였다 사라지면 더 거슬린다.
  if (isPending) return <View className="h-20" />;

  if (!keywords?.length) {
    return (
      <View className="mx-5 rounded-xl bg-gray-50 px-4 py-4">
        <Text className={textRole.label}>
          키워드를 걸어 두면 핫딜이 올라올 때 알려 드려요
        </Text>
        <Text className={cn('mt-1', textRole.caption)}>
          아래 키워드를 눌러 30일 핫딜을 보고, 마음에 들면 그 자리에서 알림을 걸
          수 있어요.
        </Text>
        {/* 라임 주 버튼(lg) — 작은 버튼(sm)은 짙은 판이라 다크에서 회색 카드 바탕에 묻혔다(10/20 시뮬 실측). web 과 같은 라임. */}
        <Button size="lg" onPress={onRegister} className="mt-3">
          키워드 알림 걸기
        </Button>
      </View>
    );
  }

  return (
    <View className="px-5">
      <View className="mb-3 flex-row items-baseline justify-between">
        <Text className={textRole.subtitle}>내 키워드</Text>
        <Pressable
          onPress={onRegister}
          hitSlop={8}
          accessibilityRole="button"
          style={({pressed}) => ({opacity: pressed ? 0.6 : 1})}>
          <Text className={textRole.caption}>알림 관리 ›</Text>
        </Pressable>
      </View>
      <View className="flex-row flex-wrap gap-2">
        {keywords.map(({id, keyword}) => {
          const hub = findKeywordHubForQuery(keyword, hubs);
          return (
            <Pressable
              key={id}
              onPress={() => (hub ? onOpenHub(hub) : onOpenSearch(keyword))}
              accessibilityRole="button"
              accessibilityLabel={
                hub ? `${keyword} 핫딜 모아보기` : `${keyword} 검색`
              }
              style={({pressed}) => ({opacity: pressed ? 0.7 : 1})}>
              <View className={cn('flex-row items-center', mineChip.box)}>
                <Text className={mineChip.text}>{keyword}</Text>
                {hub ? (
                  <Text className={cn('ml-1', textRole.caption)}>›</Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {paddingTop: 20},
});
