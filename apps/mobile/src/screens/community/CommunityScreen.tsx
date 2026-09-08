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
  GLASS_BOTTOM_GAP,
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
          // 포함해야 한다 — 안 하면 글래스 탭바와 겹친다(실측: 탭바 상단이
          // 바닥에서 87pt 인데 FAB 은 69pt 에 있어 21pt 만 보였다).
          {bottom: reservedBottom + GLASS_BOTTOM_GAP},
        ]}>
        <Pressable
          onPress={openWrite}
          accessibilityRole="button"
          accessibilityLabel="글쓰기"
          style={({pressed}) => [
            styles.fabShadow,
            pressed ? styles.fabPressed : null,
          ]}
          className="bg-primary-500 flex-row items-center rounded-full px-4 py-3">
          <Text className="text-lg leading-5 text-white">+</Text>
          <Text className="pl-1.5 text-sm font-semibold text-white">
            글쓰기
          </Text>
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
    shadowColor: '#101828',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 6,
  },
  fabPressed: {opacity: 0.85},
});
