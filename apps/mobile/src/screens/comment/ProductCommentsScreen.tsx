import React, {useCallback} from 'react';
import {ActivityIndicator, FlatList, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {KeyboardAvoidingView} from 'react-native-keyboard-controller';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

import {UserQueries} from '@/entities/user/user.queries';
import {CommentQueries} from '@/entities/comment/comment.queries';
import {clearEditingComment} from '@/entities/comment/editing-comment';
import Comment from '@/features/comment/ui/Comment';
import CommentInput from '@/features/comment/ui/CommentInput';
import type {TabStackParamList} from '@/navigations/tab/types';
import type {TComment} from '@/shared/api/comment/comment.service';
import {tabStackNavigations} from '@/shared/constant/navigations';

type Props = NativeStackScreenProps<
  TabStackParamList,
  typeof tabStackNavigations.COMMENTS
>;

export default function ProductCommentsScreen({route, navigation}: Props) {
  const {productId} = route.params;
  const insets = useSafeAreaInsets();

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
      <View style={{height: insets.top}} className="bg-white" />
      <View className="flex-row items-center border-b border-gray-100 px-5 py-3">
        <Pressable
          onPress={() => {
            // 화면을 벗어나면서 편집 상태를 남기면 다음 진입에 그대로 붙어 있다.
            clearEditingComment();
            navigation.goBack();
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="뒤로">
          <Text className="text-lg text-gray-700">←</Text>
        </Pressable>
        <Text className="pl-3 text-base font-semibold text-gray-900">댓글</Text>
      </View>

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
            ListEmptyComponent={
              <View className="items-center py-16">
                <Text className="text-sm text-gray-500">
                  첫 댓글을 남겨보세요
                </Text>
              </View>
            }
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
