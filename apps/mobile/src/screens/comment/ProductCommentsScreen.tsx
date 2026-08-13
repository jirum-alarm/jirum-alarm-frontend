import React, {useCallback, useEffect} from 'react';
import {ActivityIndicator, FlatList, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {UserQueries} from '@/entities/user/user.queries';
import {CommentQueries} from '@/entities/comment/comment.queries';
import {clearEditingComment} from '@/entities/comment/editing-comment';
import {
  useHideTabBar,
  useHiddenTabBarClipPadding,
} from '@/shared/hooks/useHideTabBar';
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
  // 하단 입력창을 탭바가 덮지 않게 한다.
  useHideTabBar();
  const tabBarClipPad = useHiddenTabBarClipPadding();

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
    <View className="flex-1 bg-white" style={{paddingBottom: tabBarClipPad}}>
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
        <View style={{paddingBottom: Math.max(insets.bottom, 4)}}>
          <CommentInput productId={productId} isUserLogin={!!myUserId} />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
