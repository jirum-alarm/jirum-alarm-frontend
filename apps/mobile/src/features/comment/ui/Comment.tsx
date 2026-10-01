import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Text} from '@/shared/components/ui/Text/AppText';
import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import {UserLikeTarget} from '@/shared/api/gql/graphql';
import {
  CommentService,
  type TComment,
} from '@/shared/api/comment/comment.service';
import {ProductService} from '@/shared/api/product/product.service';
import ConfirmSheet from '@/shared/components/ConfirmSheet';
import {CommentQueries} from '@/entities/comment/comment.queries';
import {
  clearEditingComment,
  setReplyTarget,
  setUpdateTarget,
  useEditStatusOf,
} from '@/entities/comment/editing-comment';
import {displayTime} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';
import {showToast, tick} from '@/shared/lib/feedback';
import BubbleChat from '@/shared/components/icons/bubble_chat';
import BubbleChatFill from '@/shared/components/icons/bubble_chat_fill';
import Dots from '@/shared/components/icons/Dots';
import ThumbsupFill from '@/shared/components/icons/ThumbsupFill';

import CommentMenu from './CommentMenu';

export default function Comment({
  comment,
  productId,
  myUserId,
  canReply,
}: {
  comment: TComment;
  productId: number;
  myUserId?: string | null;
  canReply: boolean;
}) {
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const editStatus = useEditStatusOf(comment.id);

  const isMyComment =
    !!myUserId && String(comment.author?.id ?? '#none') === String(myUserId);
  const hasParent = !!comment.parentId;
  const isLoggedIn = !!myUserId;

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: CommentQueries.keys.list(productId),
    });

  // 좋아요는 누르는 즉시 바뀐다(낙관적) — 무효화·재조회를 기다리면 한 박자 늦게 켜졌다.
  const {mutate: likeComment} = useMutation({
    mutationFn: ProductService.addUserLikeOrDislike,
    onMutate: async ({isLike}) => {
      const queryKey = CommentQueries.keys.list(productId);
      await queryClient.cancelQueries({queryKey});
      const previous = queryClient.getQueryData(queryKey);
      queryClient.setQueryData<InfiniteData<TComment[]>>(queryKey, old =>
        old
          ? {
              ...old,
              pages: old.pages.map(page =>
                page.map(c =>
                  String(c.id) === String(comment.id)
                    ? {
                        ...c,
                        isMyLike: !!isLike,
                        likeCount: Math.max(
                          0,
                          (c.likeCount ?? 0) +
                            (!!isLike === !!c.isMyLike ? 0 : isLike ? 1 : -1),
                        ),
                      }
                    : c,
                ),
              ),
            }
          : old,
      );
      return () => queryClient.setQueryData(queryKey, previous);
    },
    onSuccess: invalidate,
    onError: (_err, _vars, rollback) => {
      rollback?.();
      showToast.error('좋아요에 실패했어요.');
    },
  });

  const {mutate: removeComment} = useMutation({
    mutationFn: CommentService.removeComment,
    onSuccess: () => {
      setMenuOpen(false);
      clearEditingComment();
      showToast.success('댓글이 삭제되었어요.');
      invalidate();
    },
    onError: () => showToast.error('댓글을 삭제하지 못했어요.'),
  });

  const handleLike = () => {
    if (!isLoggedIn) {
      showToast.info('로그인 후 이용해주세요.');
      return;
    }
    tick();
    likeComment({
      target: UserLikeTarget.Comment,
      targetId: Number(comment.id),
      isLike: !comment.isMyLike,
    });
  };

  const handleReply = () => {
    if (editStatus === 'reply') {
      clearEditingComment();
      return;
    }
    setReplyTarget(comment);
  };

  // web 과 같은 배경 규칙 — 내 댓글/대댓글 여부로 4가지.
  const bg = isMyComment
    ? hasParent
      ? 'bg-primary-100'
      : 'bg-primary-50'
    : hasParent
    ? 'bg-gray-100'
    : 'bg-white';

  return (
    <View className={cn('px-5 py-4', bg, hasParent && 'pl-8')}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-x-2">
          <Text className="text-sm font-medium text-gray-600">
            {comment.author?.nickname}
          </Text>
          <Text className="text-sm text-gray-500">
            {editStatus === 'update'
              ? '수정 중'
              : displayTime(comment.createdAt)}
          </Text>
        </View>
        {isMyComment ? (
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="댓글 메뉴">
            <Dots width={24} height={24} />
          </Pressable>
        ) : null}
      </View>

      <Text className="pt-1 text-base text-gray-900">{comment.content}</Text>

      <View className="flex-row items-center gap-x-2 pt-2">
        <Pressable
          onPress={handleLike}
          disabled={!isLoggedIn}
          accessibilityRole="button"
          accessibilityLabel={`좋아요 ${comment.likeCount ?? 0}`}
          accessibilityState={{selected: !!comment.isMyLike}}
          // 16px 아이콘 + 글자 한 줄이라 터치 영역이 좁다.
          hitSlop={10}
          className="flex-row items-center gap-x-1">
          <ThumbsupFill width={16} height={16} active={!!comment.isMyLike} />
          <Text
            className={cn(
              'text-sm',
              comment.isMyLike ? 'text-primary-800' : 'text-gray-500',
            )}>
            좋아요
          </Text>
          <Text
            className={cn(
              'text-sm',
              comment.isMyLike ? 'text-primary-800' : 'text-gray-600',
            )}>
            {comment.likeCount}
          </Text>
        </Pressable>
        {canReply && !hasParent ? (
          <Pressable
            onPress={handleReply}
            disabled={!isLoggedIn}
            accessibilityRole="button"
            hitSlop={10}
            className="flex-row items-center gap-x-1">
            {editStatus === 'reply' ? (
              <BubbleChatFill width={16} height={16} />
            ) : (
              <BubbleChat width={16} height={16} color="#667085" />
            )}
            <Text
              className={cn(
                'text-sm',
                editStatus === 'reply' ? 'text-secondary-600' : 'text-gray-500',
              )}>
              답글
            </Text>
          </Pressable>
        ) : null}
      </View>

      <CommentMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onUpdate={() => {
          setMenuOpen(false);
          setUpdateTarget(comment);
        }}
        // 커뮤니티 댓글과 같게 — 한 번 탭으로 지우지 않고 묻는다.
        onRemove={() => {
          setMenuOpen(false);
          setConfirmOpen(true);
        }}
      />
      <ConfirmSheet
        visible={confirmOpen}
        title="댓글을 삭제할까요?"
        description="댓글을 삭제하면 다시 복구할 수 없어요."
        confirmLabel="삭제"
        tone="danger"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          removeComment({id: Number(comment.id)});
        }}
      />
    </View>
  );
}
