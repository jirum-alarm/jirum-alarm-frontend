import React, {useCallback, useEffect} from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {useHiddenTabBarClipPadding} from '@/shared/hooks/useHideTabBar';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {UserQueries} from '@/entities/user/user.queries';
import {CommentQueries} from '@/entities/comment/comment.queries';
import {clearEditingComment} from '@/entities/comment/editing-comment';
import Comment from '@/features/comment/ui/Comment';
import CommentEmpty from '@/features/comment/ui/CommentEmpty';
import CommentInput from '@/features/comment/ui/CommentInput';
import type {ProductFlowParamList} from '@/navigations/tab/types';
import type {TComment} from '@/shared/api/comment/comment.service';
import {tabStackNavigations} from '@/shared/constant/navigations';

type Props = NativeStackScreenProps<
  ProductFlowParamList,
  typeof tabStackNavigations.COMMENTS
>;

export default function ProductCommentsScreen({route, navigation}: Props) {
  const {productId} = route.params;
  const insets = useSafeAreaInsets();
  const bottomClip = useHiddenTabBarClipPadding();

  useEffect(() => {
    const unsub = navigation.addListener('beforeRemove', () => {
      clearEditingComment();
    });
    return unsub;
  }, [navigation]);

  const {data: myUserId} = useQuery(UserQueries.me());

  const {data, isPending, fetchNextPage, hasNextPage, isFetchingNextPage} =
    useInfiniteQuery(CommentQueries.infiniteComments(productId));

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
        keyboardVerticalOffset={0}>
        {isPending ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="small" color="#667085" />
          </View>
        ) : (
          <FlatList
            data={comments}
            keyExtractor={item => String(item.id)}
            renderItem={renderItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.4}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<CommentEmpty />}
            ListFooterComponent={
              isFetchingNextPage ? (
                <View className="py-4">
                  <ActivityIndicator size="small" color="#667085" />
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
        <View style={{paddingBottom: Math.max(insets.bottom, 4) + bottomClip}}>
          <CommentInput productId={productId} isUserLogin={!!myUserId} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
