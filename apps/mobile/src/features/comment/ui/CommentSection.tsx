import React from 'react';
import {ActivityIndicator, Pressable, Text, View} from 'react-native';
import {useInfiniteQuery} from '@tanstack/react-query';

import {CommentQueries} from '@/entities/comment/comment.queries';

import Comment from './Comment';

const PREVIEW_COUNT = 3;

/**
 * 상세 안 댓글 미리보기.
 *
 * web 과 같은 규칙 — 여기서는 페이지네이션도 답글도 하지 않고(canReply=false),
 * 전체는 전용 화면으로 보낸다.
 */
export default function CommentSection({
  productId,
  myUserId,
  onPressMore,
}: {
  productId: number;
  myUserId?: string | null;
  onPressMore: () => void;
}) {
  const {data, isPending} = useInfiniteQuery(
    CommentQueries.infiniteComments(productId),
  );

  const comments = data?.pages.flat() ?? [];
  const preview = comments.slice(0, PREVIEW_COUNT);

  return (
    <View className="pt-7">
      <Text className="px-5 pb-3 text-lg font-semibold text-gray-900">
        댓글
      </Text>

      {isPending ? (
        <View className="h-[80px] items-center justify-center">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      ) : preview.length === 0 ? (
        <Pressable
          onPress={onPressMore}
          className="mx-5 rounded-lg bg-gray-50 py-6">
          <Text className="text-center text-sm text-gray-500">
            첫 댓글을 남겨보세요
          </Text>
        </Pressable>
      ) : (
        <>
          {preview.map(comment => (
            <Comment
              key={String(comment.id)}
              comment={comment}
              productId={productId}
              myUserId={myUserId}
              canReply={false}
            />
          ))}
          <Pressable
            onPress={onPressMore}
            className="mx-5 mt-3 rounded-lg border border-gray-200 py-3"
            accessibilityRole="button">
            <Text className="text-center text-sm font-medium text-gray-700">
              댓글 {comments.length >= PREVIEW_COUNT ? '전체 ' : ''}보기
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
