'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';

import { UserLikeTarget } from '@/shared/api/gql/graphql';
import { LikeService } from '@/shared/api/like/like.service';
import useRedirectIfNotLoggedIn from '@/shared/hooks/useRedirectIfNotLoggedIn';
import { cn } from '@/shared/lib/cn';
import { BubbleChat, BubbleChatFill, ThumbsupFill } from '@/shared/ui/common/icons';
import { useToast } from '@/shared/ui/common/Toast';

import { CommentQueries, defaultCommentsVariables } from '@/entities/comment';

import { CANCEL_EVENT, REPLY_EVENT, TComment, TEditStatus } from './CommentLayout';

type CommentActionProps = {
  comment: TComment;
  canReply: boolean;
  hasParentComment: boolean;
  editStatus?: TEditStatus;
  isUserLogin: boolean;
};

export default function CommentAction({
  comment,
  canReply,
  hasParentComment,
  editStatus,
  isUserLogin,
}: CommentActionProps) {
  const { toast } = useToast();
  const { checkAndRedirect } = useRedirectIfNotLoggedIn();

  const queryClient = useQueryClient();

  const { mutate: likeComment } = useMutation({
    mutationFn: LikeService.addUserLikeOrDislike,
    onSuccess: () => {
      // TODO: Need GTM Migration
      queryClient.invalidateQueries({
        queryKey: CommentQueries.infiniteComments({
          productId: comment.productId!,
          ...defaultCommentsVariables,
        }).queryKey,
      });
    },
  });

  // 비로그인 — 버튼을 막지(disabled) 않고 눌렀을 때 로그인을 권한다(찜·추천과 같은 로그인 모달, 앱 웹뷰면 로그인 화면).
  // 예전엔 disabled 라 눌러도 아무 일이 없었다(아래 토스트도 절대 안 떴다 — Clarity dead click, 2026-10-20).
  const promptLogin = () => {
    const opened = checkAndRedirect({
      title: '댓글에 반응하려면 로그인이 필요해요',
      description: '로그인하고 좋아요·대댓글로 이야기에 참여해보세요',
    });
    // 서버 판정(isUserLogin)과 브라우저 로그인 상태가 어긋나 모달이 안 뜨면 최소한 안내는 한다.
    if (!opened) toast('로그인 후 이용해주세요.');
  };

  const handleLike = () => {
    if (!isUserLogin) {
      promptLogin();
      return;
    }

    likeComment({
      target: UserLikeTarget.Comment,
      targetId: Number(comment.id),
      isLike: !comment.isMyLike,
    });
  };

  const handleReply = () => {
    if (!isUserLogin) {
      promptLogin();
      return;
    }
    if (isReply) {
      document.dispatchEvent(new CustomEvent(CANCEL_EVENT));
      return;
    }
    document.dispatchEvent(new CustomEvent(REPLY_EVENT, { detail: comment }));
  };

  const isReply = editStatus === 'reply';

  // -my/py: 글자 줄(20px)은 그대로 두고 누르는 높이만 40px 로.
  return (
    <>
      <button
        type="button"
        className="-my-2.5 flex h-auto items-center gap-x-1 bg-transparent py-2.5"
        onClick={handleLike}
      >
        <ThumbsupFill className="h-4 w-4" active={!!comment.isMyLike} />
        <span className={cn('text-sm', comment.isMyLike ? 'text-primary-800' : 'text-gray-500')}>
          좋아요
        </span>
        <span className={cn('text-sm', comment.isMyLike ? 'text-primary-800' : 'text-gray-600')}>
          {comment.likeCount}
        </span>
      </button>
      {canReply && !hasParentComment && (
        <button
          type="button"
          className="-my-2.5 flex h-auto items-center gap-x-1 bg-transparent py-2.5"
          onClick={handleReply}
        >
          {isReply ? (
            <BubbleChatFill className="h-4 w-4" aria-hidden />
          ) : (
            <BubbleChat className="h-4 w-4" aria-hidden />
          )}
          <span className={cn('text-sm', isReply ? 'text-secondary-600' : 'text-gray-500')}>
            대댓글
          </span>
        </button>
      )}
    </>
  );
}
