'use client';

import { useSuspenseInfiniteQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { LoadingSpinner, BubbleChatFill } from '@/components/common/icons';
import TopButton from '@/components/TopButton';
import { defaultCommentsVariables, CommentQueries } from '@/entities/comment';
import { CommentsQuery } from '@/shared/api/gql/graphql';

import Comment from './Comment';
import CommentInput from './CommentInput';

export type TComment = NonNullable<CommentsQuery['comments']>[number];

export type TEditStatus = 'reply' | 'update';

export const CANCEL_EVENT = 'comment-cancel-event';
export const REPLY_EVENT = 'comment-reply-event';
export const UPDATE_EVENT = 'comment-update-event';

export default function CommentLayout({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const [editingComment, setEditingComment] = useState<{
    comment: TComment;
    status: TEditStatus;
  } | null>(null);

  const {
    data: { pages },
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useSuspenseInfiniteQuery(
    CommentQueries.infiniteComments({
      productId,
      ...defaultCommentsVariables,
    }),
  );

  const { ref } = useInView({
    onChange(inView) {
      if (inView && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
  });

  useEffect(() => {
    const cancel = () => setEditingComment(null);
    const reply = (e: Event) => {
      const customEvent = e as CustomEvent<TComment>;
      setEditingComment({ comment: customEvent.detail, status: 'reply' });
    };
    const update = (e: Event) => {
      const customEvent = e as CustomEvent<TComment>;
      setEditingComment({ comment: customEvent.detail, status: 'update' });
    };

    document.addEventListener(CANCEL_EVENT, cancel);
    document.addEventListener(REPLY_EVENT, reply);
    document.addEventListener(UPDATE_EVENT, update);

    return () => {
      document.removeEventListener(CANCEL_EVENT, cancel);
      document.removeEventListener(REPLY_EVENT, reply);
      document.removeEventListener(UPDATE_EVENT, update);
    };
  }, []);

  const comments = pages.flatMap(({ comments }) => comments);
  return (
    <>
      {comments.length > 0 ? (
        <>
          <main className="flex grow flex-col divide-y divide-gray-200 pb-[64px] pt-[56px]">
            {comments.map((comment) => {
              return (
                <Comment
                  key={comment.id}
                  comment={comment}
                  editStatus={
                    editingComment?.status === 'update' && editingComment?.comment.id === comment.id
                      ? 'update'
                      : editingComment?.status === 'reply' &&
                          editingComment?.comment.id === comment.id
                        ? 'reply'
                        : undefined
                  }
                  canReply
                />
              );
            })}
          </main>
          <div className="flex w-full items-center justify-center py-6" ref={ref}>
            {isFetchingNextPage && <LoadingSpinner />}
          </div>
        </>
      ) : (
        <CommentListSkeleton />
      )}
      <TopButton />
      <CommentInput
        productId={productId}
        isUserLogin={isUserLogin}
        editingComment={editingComment}
      />
    </>
  );
}

const CommentListSkeleton = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center pb-[64px] pt-[56px]">
      <div className="flex flex-col items-center gap-y-3">
        <BubbleChatFill />
        <div className="flex flex-col items-center gap-y-1">
          <p className="font-semibold text-gray-700">가장 먼저 댓글을 달아보세요!</p>
          <p className="text-sm font-medium text-gray-500">핫딜을 주제로 소통해요</p>
        </div>
      </div>
    </div>
  );
};
