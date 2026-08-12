import React from 'react';
import {ActivityIndicator, Text, View} from 'react-native';

import PressableScale from '@/shared/components/PressableScale';
import {useInfiniteQuery} from '@tanstack/react-query';

import {CommentQueries} from '@/entities/comment/comment.queries';

import SectionErrorRow from '@/shared/components/SectionErrorRow';

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
  const {data, isPending, isError, refetch} = useInfiniteQuery(
    CommentQueries.infiniteComments(productId),
  );

  const comments = data?.pages.flat() ?? [];
  const preview = comments.slice(0, PREVIEW_COUNT);
  const hasComments = comments.length > 0;

  return (
    <View className="pt-7">
      <Text className="px-5 pb-3 text-lg font-semibold text-gray-900">
        지름알림 댓글
        {comments.length > 0 ? (
          <Text className="text-secondary-500"> {comments.length}개</Text>
        ) : null}
      </Text>

      {isError ? (
        <SectionErrorRow label="댓글" onRetry={refetch} />
      ) : isPending ? (
        <View className="h-[80px] items-center justify-center">
          <ActivityIndicator size="small" color="#667085" />
        </View>
      ) : (
        <>
          {/* web CommentList 는 댓글이 없으면 목록 자체를 안 그린다 —
              "첫 댓글을 남겨보세요" 같은 빈 상태 박스는 web 에 없다(내가 넣었던 것). */}
          {preview.map(comment => (
            <Comment
              key={String(comment.id)}
              comment={comment}
              productId={productId}
              myUserId={myUserId}
              canReply={false}
            />
          ))}
          {/* 버튼은 댓글 유무와 무관하게 항상 뜨고 문구만 갈린다(web renderMobile). */}
          <View className="mt-8 px-12">
            <PressableScale
              onPress={onPressMore}
              className="rounded-lg bg-gray-100 py-3"
              accessibilityRole="button">
              <Text className="text-center text-sm font-medium text-gray-700">
                {hasComments ? '댓글 보기' : '댓글 작성하기'}
              </Text>
            </PressableScale>
          </View>
        </>
      )}
    </View>
  );
}
