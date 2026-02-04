'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { AuthQueries } from '@/entities/auth';

import useComment from '../model/useComment';

import Comment from './Comment';
import CommentListSkeleton from './CommentListSkeleton';

function CommentList({ productId, isMobile }: { productId: number; isMobile: boolean }) {
  const { pages, editingComment } = useComment(productId);

  const comments = pages.flatMap(({ comments }) => comments);

  if (!comments.length) {
    return (
      <>
        <CommentListSkeleton />
      </>
    );
  }

  return (
    <div className="relative flex flex-col">
      <div className="relative flex max-h-[400px] flex-col divide-y divide-gray-200 overflow-hidden">
        {comments.map((comment) => {
          const editStatus =
            editingComment?.status === 'update' && editingComment?.comment.id === comment.id
              ? 'update'
              : editingComment?.status === 'reply' && editingComment?.comment.id === comment.id
                ? 'reply'
                : undefined;
          return (
            <Comment
              key={comment.id}
              comment={comment}
              editStatus={editStatus}
              canReply={!isMobile}
            />
          );
        })}
      </div>
      {comments.length > 1 && isMobile && (
        <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-linear-to-t from-white to-transparent" />
      )}
    </div>
  );
}

export default CommentList;
