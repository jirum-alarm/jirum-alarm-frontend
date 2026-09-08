import React, {useCallback, useRef, useState} from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useInfiniteQuery} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {SystemBars} from 'react-native-edge-to-edge';

import {CommunityQueries, type CommunityTab} from '@/entities/community';
import CommunityHotDeals from '@/features/community/ui/CommunityHotDeals';
import CommunityPostCard from '@/features/community/ui/CommunityPostCard';
import CommunityTabBar from '@/features/community/ui/CommunityTabBar';
import NoticePostCard from '@/features/community/ui/NoticePostCard';
import {
  getFabPaddingPx,
  getReservedBottomPx,
} from '@/navigations/tab/tab-bar-metrics';
import {useRegisterScrollToTop} from '@/navigations/tab/scroll-to-top-store';
import type {TabStackParamList} from '@/navigations/tab/types';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {ListRowsSkeleton} from '@/shared/components/Skeletons';
import type {CommunityPost} from '@/shared/api/community';
import {
  tabNavigations,
  tabStackNavigations,
} from '@/shared/constant/navigations';

/** web PageHeader 와 같은 높이(h-14). */
const HEADER_HEIGHT = 56;

type Nav = NativeStackNavigationProp<TabStackParamList>;

/**
 * 커뮤니티 탭 루트. web `/community`
 * (BasicLayout + PageHeader + CommunityPageClient + CommunityHotDeals) 대응.
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

  /**
   * 커뮤니티 탭 재탭 → 목록 맨 위로. (웹뷰 시절 injectJavaScript 를 대체 —
   * 등록하지 않으면 탭바가 웹뷰 주입으로 폴백하고, 이 탭엔 이제 웹뷰가 없어
   * **아무 반응 없이** 조용히 끝난다.)
   */
  const listRef = useRef<FlatList<CommunityPost>>(null);
  const scrollToTop = useCallback(() => {
    listRef.current?.scrollToOffset({offset: 0, animated: true});
  }, []);
  useRegisterScrollToTop(tabNavigations.COMMUNITY, scrollToTop);

  const openPost = useCallback(
    (postId: number) => {
      navigation.push(tabStackNavigations.COMMUNITY_POST, {postId});
    },
    [navigation],
  );

  const openWrite = useCallback(() => {
    navigation.push(tabStackNavigations.COMMUNITY_WRITE, {});
  }, [navigation]);

  const reservedBottom = getReservedBottomPx(insets.bottom);

  const renderItem = useCallback(
    ({item, index}: {item: CommunityPost; index: number}) =>
      tab === 'notice' ? (
        // web: 공지 탭 첫 줄만 NEW
        <NoticePostCard post={item} isNew={index === 0} onPress={openPost} />
      ) : (
        <CommunityPostCard post={item} onPress={openPost} />
      ),
    [tab, openPost],
  );

  return (
    <View className="flex-1 bg-white" style={{paddingTop: insets.top}}>
      <SystemBars style="dark" hidden={false} />

      {/* 헤더 — web PageHeader(title="커뮤니티") */}
      <View
        className="flex-row items-center border-b border-gray-100 bg-white px-5"
        style={{height: HEADER_HEIGHT}}>
        <Text className="text-lg font-semibold text-gray-900">커뮤니티</Text>
      </View>

      <CommunityTabBar activeTab={tab} onChange={setTab} />

      {isError ? (
        <View className="flex-1">
          <SectionErrorRow label="커뮤니티" onRetry={refetch} />
        </View>
      ) : isPending ? (
        <ListRowsSkeleton count={6} thumbnailSize={80} />
      ) : (
        <FlatList
          // ★탭이 바뀌면 목록을 새로 그린다(위 주석 참조).
          key={tab}
          ref={listRef}
          data={posts}
          keyExtractor={item => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={false}
              onRefresh={refetch}
              tintColor="#667085"
            />
          }
          onEndReachedThreshold={0.5}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          contentContainerStyle={{paddingBottom: reservedBottom}}
          ListEmptyComponent={
            <View className="items-center py-20">
              <Text className="text-sm text-gray-500">
                아직 게시글이 없어요.
              </Text>
            </View>
          }
          ListFooterComponent={
            <>
              {isFetchingNextPage ? (
                <View className="h-12 items-center justify-center">
                  <ActivityIndicator size="small" color="#667085" />
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

      {/* 글쓰기 FAB — web CommunityList 의 모바일 전용 fixed 버튼. */}
      <Pressable
        onPress={openWrite}
        accessibilityRole="button"
        accessibilityLabel="글쓰기"
        style={({pressed}) => [
          styles.fab,
          {bottom: getFabPaddingPx(insets.bottom) + 8},
          pressed ? {opacity: 0.85} : null,
        ]}
        className="bg-primary-500 flex-row items-center rounded-full px-4 py-3">
        <Text className="text-lg leading-5 text-white">+</Text>
        <Text className="pl-1.5 text-sm font-semibold text-white">글쓰기</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  /**
   * ★크기·위치는 style, 색·padding 은 className (NativeWind 규칙).
   * 그림자는 iOS 에서 overflow:hidden 과 공존하지 못하므로 이 뷰에는
   * overflow 를 주지 않는다.
   */
  fab: {
    position: 'absolute',
    right: 20, // web right-5
    shadowColor: '#101828',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
});
