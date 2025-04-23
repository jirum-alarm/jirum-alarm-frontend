'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { BubbleChat, ThumbsupFill } from '@/components/common/icons';
import { defaultCommentsVariables, CommentQueries } from '@/entities/comment';
import { cn } from '@/lib/cn';
import { UserLikeTarget } from '@/shared/api/gql/graphql';
import { LikeService } from '@/shared/api/like/like.service';

import { CANCEL_EVENT, REPLY_EVENT, TComment, TEditStatus } from './CommentLayout';

type CommentActionProps = {
  comment: TComment;
  canReply: boolean;
  hasParentComment: boolean;
  editStatus?: TEditStatus;
};

export default function CommentAction({
  comment,
  canReply,
  hasParentComment,
  editStatus,
}: CommentActionProps) {
  const queryClient = useQueryClient();

  const { mutate: likeComment } = useMutation({
    mutationFn: LikeService.addUserLikeOrDislike,
    onSuccess: () => {
      // TODO: Need GTM Migration
      queryClient.invalidateQueries({
        queryKey: CommentQueries.infiniteComments({
          productId: comment.productId,
          ...defaultCommentsVariables,
        }).queryKey,
      });
    },
  });

  const handleLike = () => {
    likeComment({
      target: UserLikeTarget.Comment,
      targetId: Number(comment.id),
      isLike: !comment.isMyLike,
    });
  };

  const handleReply = () => {
    if (isReply) {
      document.dispatchEvent(new CustomEvent(CANCEL_EVENT));
      return;
    }
    document.dispatchEvent(new CustomEvent(REPLY_EVENT, { detail: comment }));
  };

  const isReply = editStatus === 'reply';

  return (
    <>
      <button className="flex h-auto items-center gap-x-1 bg-transparent" onClick={handleLike}>
        <ThumbsupFill className="h-4 w-4" active={!!comment.isMyLike} />
        <span className={cn('text-sm', comment.isMyLike ? 'text-primary-700' : 'text-gray-500')}>
          좋아요
        </span>
        <span className={cn('text-sm', comment.isMyLike ? 'text-primary-700' : 'text-gray-600')}>
          {comment.likeCount}
        </span>
      </button>
      {canReply && !hasParentComment && (
        <button className="flex h-auto items-center gap-x-1 bg-transparent" onClick={handleReply}>
          <BubbleChat className="h-4 w-4" active={isReply} />
          <span className={cn('text-sm', isReply ? 'text-secondary-500' : 'text-gray-500')}>
            대댓글
          </span>
        </button>
      )}
    </>
  );
}
