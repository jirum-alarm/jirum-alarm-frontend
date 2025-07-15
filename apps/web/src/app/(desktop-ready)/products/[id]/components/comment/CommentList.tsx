'use client';

import { User } from '@/shared/api/gql/graphql';

import Comment from '../../comment/components/Comment';
import useComment from '../../comment/hooks/useComment';

import CommentListSkeleton from './CommentListSkeleton';

export default function CommentList({
  productId,
  isMobile,
  me,
}: {
  productId: number;
  isMobile: boolean;
  me?: User;
}) {
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
              user={me}
            />
          );
        })}
      </div>
      {comments.length > 1 && isMobile && (
        <div className="pointer-events-none absolute bottom-0 left-0 h-12 w-full bg-gradient-to-t from-white to-transparent" />
      )}
    </div>
  );
}
