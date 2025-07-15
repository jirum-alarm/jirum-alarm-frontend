'use client';

import { LoadingSpinner } from '@/components/common/icons';
import TopButton from '@/components/TopButton';
import { CommentsQuery } from '@/shared/api/gql/graphql';

import CommentListSkeleton from '../../components/comment/CommentListSkeleton';
import useComment from '../hooks/useComment';

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
  const { pages, ref, editingComment, isFetchingNextPage } = useComment(productId);

  const comments = pages.flatMap(({ comments }) => comments);
  return (
    <>
      {comments.length > 0 ? (
        <>
          <main className="flex grow flex-col divide-y divide-gray-200 pb-[64px] pt-[56px]">
            {comments.map((comment) => {
              const editStatus =
                editingComment?.status === 'update' && editingComment?.comment.id === comment.id
                  ? 'update'
                  : editingComment?.status === 'reply' && editingComment?.comment.id === comment.id
                    ? 'reply'
                    : undefined;
              return (
                <Comment key={comment.id} comment={comment} editStatus={editStatus} canReply />
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
      <div className="fixed bottom-0 z-40 max-w-screen-mobile-max px-5 py-3">
        <CommentInput productId={productId} isUserLogin={isUserLogin} />
      </div>
    </>
  );
}
