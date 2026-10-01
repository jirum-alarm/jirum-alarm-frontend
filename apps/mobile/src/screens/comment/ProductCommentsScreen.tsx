import React, {useCallback, useEffect, useLayoutEffect} from 'react';
import {ActivityIndicator, FlatList, RefreshControl, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {useAuth} from '@/shared/hooks/useAuth';
import {usePullRefresh} from '@/shared/hooks/usePullRefresh';
import SectionErrorRow from '@/shared/components/SectionErrorRow';
import {
  KeyboardAvoidingView,
  useKeyboardState,
} from 'react-native-keyboard-controller';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useHeaderHeight} from '@react-navigation/elements';

import {UserQueries} from '@/entities/user/user.queries';
import {CommentQueries} from '@/entities/comment/comment.queries';
import {clearEditingComment} from '@/entities/comment/editing-comment';
import Comment from '@/features/comment/ui/Comment';
import CommentEmpty from '@/features/comment/ui/CommentEmpty';
import CommentInput from '@/features/comment/ui/CommentInput';
import {DetailHeaderBackButton} from '@/screens/detail/ui/ProductDetailHeader';
import type {ProductFlowParamList} from '@/navigations/tab/types';
import type {TComment} from '@/shared/api/comment/comment.service';
import {tabStackNavigations} from '@/shared/constant/navigations';
import {useColors} from '@/shared/theme/useColors';

type Props = NativeStackScreenProps<
  ProductFlowParamList,
  typeof tabStackNavigations.COMMENTS
>;

export default function ProductCommentsScreen({route, navigation}: Props) {
  const c = useColors();
  const {productId} = route.params;
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState(state => state.isVisible);
  // KeyboardAvoidingView 는 자기 위치를 부모 기준(onLayout)으로 잰다 — 위에 네이티브 헤더가 있으면
  // 그 높이만큼 덜 밀어 입력창이 키보드 뒤에 묻혔다(키보드만 올라옴). 헤더 높이를 넘겨 보정한다.
  const headerHeight = useHeaderHeight();
  const bottomClip = useHiddenTabBarClipPadding();

  // 시스템 back 은 선이 굵어 상세·커뮤니티 헤더와 어긋난다 — 같은 규격으로.
  useLayoutEffect(() => {
    navigation.setOptions({
      // eslint-disable-next-line react/no-unstable-nested-components
      headerLeft: ({canGoBack}) =>
        canGoBack ? (
          <DetailHeaderBackButton onPress={() => navigation.goBack()} />
        ) : null,
    });
  }, [navigation]);

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      clearEditingComment();
    });
    return unsub;
  }, [navigation]);

  const {data: myUserId} = useQuery(UserQueries.me());

  // 로그인 여부는 토큰으로 본다 — me() 로 보면 조회 중·실패 때 로그인 사용자에게도
  // "로그인 후 이용해주세요" 가 떴다.
  const {isLogin} = useAuth();

  const {
    data,
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery(CommentQueries.infiniteComments(productId));
  const {refreshing, onRefresh} = usePullRefresh(refetch);

  const comments = data?.pages.flat() ?? [];

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderItem = useCallback(
    ({item}: {item: TComment}) => (
      <Comment
        comment={item}
        productId={productId}
        myUserId={myUserId}
        canReply
      />
    ),
    [productId, myUserId],
  );

  return (
    <View className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1"
        keyboardVerticalOffset={headerHeight}>
        {isPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" className="text-gray-500" />
          </View>
        ) : isError && comments.length === 0 ? (
          // 실패를 "첫 댓글을 남겨주세요" 로 위장하지 않는다.
          <View className="flex-1 pt-4">
            <SectionErrorRow label="댓글" onRetry={refetch} />
          </View>
        ) : (
          <FlatList
            data={comments}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={c.gray[500]}
              />
            }
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<CommentEmpty />}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="small" className="text-gray-500" />
                </View>
              ) : null
            }
          />
        )}
        {/*
          ★clip 보정. 탭바를 숨기는 유일한 수단이 화면째로 clipPx 만큼 내려서
          잘라내는 것이라(`createNativeBottomTabNavigator`), 바닥에 붙은 이
          입력창이 그 잘린 영역으로 들어가 **통째로 사라졌다**(iOS 26 실측:
          마지막 1px 만 보였다 — 사용자 지적 2회). 내정보 하위 화면 11개는
          이미 같은 훅으로 되돌리고 있다.
        */}
        {/* 키보드가 떠 있으면 홈 인디케이터·clip 여백은 키보드 아래로 들어간다 — 그대로 두면
            입력창이 키보드 위에 그만큼(~34pt+) 떠 보였다. */}
        <View
          style={{
            paddingBottom: keyboardVisible
              ? 4
              : Math.max(insets.bottom, 4) + bottomClip,
          }}>
          <CommentInput productId={productId} isUserLogin={isLogin} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
