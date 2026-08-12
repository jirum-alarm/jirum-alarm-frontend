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
          {/* web 은 빈 목록에 아무것도 안 그리지만, 앱에서는 헤더와 버튼 사이가
              텅 비어 "로딩이 안 끝난 것"처럼 보인다(사용자 요청 2026-08-12). */}
          {!hasComments ? (
            <View className="items-center py-8">
              <Text className="pb-2 text-2xl">💬</Text>
              <Text className="text-sm text-gray-400">
                첫 번째 댓글을 남겨보세요
              </Text>
            </View>
          ) : null}
          {/* web CommentList 의 divide-y divide-gray-200 대응 — 댓글 사이에만 선. */}
          {preview.map((comment, i) => (
            <View
              key={String(comment.id)}
              className={i > 0 ? 'border-t border-gray-200' : undefined}>
              <Comment
                comment={comment}
                productId={productId}
                myUserId={myUserId}
                canReply={false}
              />
            </View>
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
