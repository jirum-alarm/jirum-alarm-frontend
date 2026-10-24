import {emptyText} from '@jirum/design-system/recipes';
import {isNewNotice} from '@jirum/domain/community';
import {fixed} from '@jirum/design-system';
import React, {useCallback, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {useInfiniteQuery, useQueryClient} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {CommunityQueries, type CommunityTab} from '@/entities/community';
import CommunityHotDeals from '@/features/community/ui/CommunityHotDeals';
import CommunityPostCard from '@/features/community/ui/CommunityPostCard';
import CommunityTabBar from '@/features/community/ui/CommunityTabBar';
import NoticePostCard from '@/features/community/ui/NoticePostCard';
import {GLASS_BOTTOM_GAP} from '@/navigations/tab/tab-bar-metrics';
import StackHeader from '@/features/mypage/ui/StackHeader';
import type {TabStackParamList} from '@/shared/lib/navigation/param-list';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import {refetchFirstPage} from '@/shared/lib/client/refetch-first-page';
import {ListRowsSkeleton} from '@/shared/components/Skeletons';
import type {CommunityPost} from '@/shared/api/community';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useColors} from '@/shared/theme/useColors';

type Nav = NativeStackNavigationProp<TabStackParamList>;

/**
 * 커뮤니티 목록. web `/community`
 * (BasicLayout hasBackButton + CommunityPageClient + CommunityHotDeals) 대응.
 * 2026-10-20 하단 탭에서 내려 홈 헤더 말풍선으로 들어오는 화면이 됐다(탭 자리는 키워드) — 그래서 뒤로가기 헤더를 갖고
 * 탭바가 없으니 바닥 여백은 홈 인디케이터만큼이다.
 *
 * ★옮기지 않은 web 분기 — 앱에서 도달할 수 없어서 옮기면 죽은 코드가 된다:
 *   - 비로그인 분기(`isUserLogin` 으로 글쓰기 버튼을 숨김): `RootNavigator` 가
 *     앱 전체를 로그인 뒤에 두므로 이 탭에 비로그인으로 못 온다.
 *   - 데스크톱 분기(2열 그리드 · 사이드바 지름랭킹 · 헤더의 글쓰기 버튼 ·
 *     목록 중간 삽입 `insertAfterIndex`): 모두 `md:` 이상에서만 뜬다.
 *
 * ★탭 전환 시 스크롤: web 은 탭별 스크롤 위치를 sessionStorage 에 저장해
 * 복원하지만, 앱은 `key={tab}` 으로 목록을 새로 그려 맨 위에서 시작한다
 * (발견 탭 카테고리 칩과 같은 규칙 — 같은 목록처럼 보이는데 스크롤만 남아
 * 있으면 어디쯤인지 알 수 없다).
 */
export default function CommunityScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<CommunityTab>('all');

  const {
    data,
    isPending,
    isError,
    refetch,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(CommunityQueries.posts(tab));

  const posts = data?.pages.flat() ?? [];

  const openPost = useCallback(
    (postId: number) => {
      navigation.push(tabStackNavigations.COMMUNITY_POST, {postId});
    },
    [navigation],
  );

  const openWrite = useCallback(() => {
    navigation.push(tabStackNavigations.COMMUNITY_WRITE, {});
  }, [navigation]);

  const reservedBottom = insets.bottom;

  const renderItem = useCallback(
    ({item, index}: {item: CommunityPost; index: number}) =>
      tab === 'notice' ? (
        // web: 공지 탭 첫 줄이 최근(7일) 공지일 때만 NEW
        <NoticePostCard
          post={item}
          isNew={index === 0 && isNewNotice(item.createdAt)}
          onPress={openPost}
        />
      ) : (
        <CommunityPostCard post={item} onPress={openPost} />
      ),
    [tab, openPost],
  );

  // 당기면 첫 페이지부터 — 깊이 내린 뒤 당기면 페이지 수만큼 왕복을 차례로 기다렸다.
  const queryClient = useQueryClient();
  const pullRefresh = useCallback(
    () => refetchFirstPage(queryClient, CommunityQueries.posts(tab).queryKey),
    [queryClient, tab],
  );
  const {refreshing, onRefresh} = usePullRefresh(pullRefresh);

  return (
    <View className="flex-1 bg-white">
      <StackHeader title="커뮤니티" onBack={navigation.goBack} />

      <CommunityTabBar activeTab={tab} onChange={setTab} />

      {isError && !posts?.length ? (
        <View className="flex-1">
          <SectionErrorRow label="커뮤니티" onRetry={refetch} />
        </View>
      ) : isPending ? (
        <ListRowsSkeleton count={6} thumbnailSize={80} />
      ) : (
        <FlatList
          // ★탭이 바뀌면 목록을 새로 그린다(위 주석 참조).
          key={tab}
          data={posts}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={c.gray[500]}
            />
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          contentContainerStyle={{paddingBottom: reservedBottom}}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className={emptyText}>아직 게시글이 없어요.</Text>
            </View>
          }
          ListFooterComponent={
            <>
              {isFetchingNextPage ? (
                <View className="h-12 items-center justify-center">
                  <ActivityIndicator size="small" className="text-gray-500" />
                </View>
              ) : null}
              {/*
                web 은 목록 아래에 이 섹션을 놓는다(모바일). FlatList 가 화면을
                꽉 채우므로 푸터가 그 자리다 — 별 ScrollView 로 감싸면
                무한스크롤이 죽는다.
              */}
              <CommunityHotDeals />
            </>
          }
        />
      )}

      {/* 글쓰기 FAB — web CommunityList 의 모바일 전용 fixed 버튼.
          🔴위치를 **감싸는 View** 가 잡는다. 예전엔 Pressable 하나에
          함수형 `style`(absolute·right) 과 `className` 을 같이 줬는데 위치가
          적용되지 않아 버튼이 **화면 폭을 꽉 채운 초록 띠**가 되어 탭바 뒤로
          깔렸다(사용자 지적). 이 레포에서 세 번째로 나온 모양이다 —
          "web 은 인라인 요소라 글자 폭만 차지하는데 RN 은 블록이라 늘어난다".
          위치·크기는 style 만 있는 뷰가, 색·padding·모양은 className 이 맡는다. */}
      <View
        // 버튼 바깥은 목록이 계속 스크롤돼야 한다.
        pointerEvents="box-none"
        style={[
          styles.fabWrap,
          // 🔴`getFabPaddingPx` 를 쓰지 않는다. 그건 **웹뷰**에 주입하는 값이라
          // iOS 26 에서 safe-area 를 일부러 뺀다(web 이 자기 1rem 을 더한다).
          // 네이티브 화면의 `bottom: 0` 은 홈 인디케이터 **아래**라 safe-area 를
          // 포함해야 한다. 탭 위에 쌓인 화면이라 탭바는 없다(2026-10-20).
          {bottom: reservedBottom + GLASS_BOTTOM_GAP},
        ]}>
        <Pressable
          onPress={openWrite}
          accessibilityRole="button"
          accessibilityLabel="글쓰기"
          // ★Pressable 엔 opacity 만 — 모양·그림자는 안쪽 View(ThemeCards 주석 참조).
          style={({pressed}) => ({opacity: pressed ? 0.85 : 1})}>
          <View
            className="bg-primary-500 flex-row items-center rounded-full px-4 py-3"
            style={styles.fabShadow}>
            {/* 라임 위 흰 글자는 1.4:1 — 주 버튼(Button primary)처럼 gray-900. */}
            <Text className="text-lg leading-5 text-fixed-900">+</Text>
            <Text className="pl-1.5 text-sm font-semibold text-fixed-900">
              글쓰기
            </Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * ★크기·위치는 style, 색·padding 은 className (NativeWind 규칙).
   * 그림자는 iOS 에서 overflow:hidden 과 공존하지 못하므로 이 뷰에는
   * overflow 를 주지 않는다.
   */
  /** 위치만. 오른쪽 정렬은 `alignItems` 로 — 폭을 주지 않아 버튼이 내용만큼만 된다. */
  fabWrap: {
    position: 'absolute',
    right: 20, // web right-5
    alignItems: 'flex-end',
  },
  fabShadow: {
    shadowColor: fixed[900],
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
});
