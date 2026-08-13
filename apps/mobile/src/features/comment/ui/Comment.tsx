import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import {UserLikeTarget} from '@/shared/api/gql/graphql';
import {
  CommentService,
  type TComment,
} from '@/shared/api/comment/comment.service';
import {ProductService} from '@/shared/api/product/product.service';
import {CommentQueries} from '@/entities/comment/comment.queries';
import {
  clearEditingComment,
  setReplyTarget,
  setUpdateTarget,
  useEditStatusOf,
} from '@/entities/comment/editing-comment';
import {displayTime} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';
import {showToast} from '@/shared/lib/feedback';
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
  const editStatus = useEditStatusOf(comment.id);

  const isMyComment =
    !!myUserId && String(comment.author?.id ?? '#none') === String(myUserId);
  const hasParent = !!comment.parentId;
  const isLoggedIn = !!myUserId;

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: CommentQueries.keys.list(productId),
    });

  const {mutate: likeComment} = useMutation({
    mutationFn: ProductService.addUserLikeOrDislike,
    onSuccess: invalidate,
  });

  const {mutate: removeComment} = useMutation({
    mutationFn: CommentService.removeComment,
    onSuccess: () => {
      setMenuOpen(false);
      clearEditingComment();
      showToast.info('댓글이 삭제되었습니다.');
      invalidate();
    },
  });

  const handleLike = () => {
    if (!isLoggedIn) {
      showToast.info('로그인 후 이용해주세요.');
      return;
    }
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
              ? '수정중'
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
          className="flex-row items-center gap-x-1">
          <ThumbsupFill width={16} height={16} active={!!comment.isMyLike} />
          <Text
            className={cn(
              'text-sm',
              comment.isMyLike ? 'text-primary-700' : 'text-gray-500',
            )}>
            좋아요
          </Text>
          <Text
            className={cn(
              'text-sm',
              comment.isMyLike ? 'text-primary-700' : 'text-gray-600',
            )}>
            {comment.likeCount}
          </Text>
        </Pressable>
        {canReply && !hasParent ? (
          <Pressable
            onPress={handleReply}
            disabled={!isLoggedIn}
            accessibilityRole="button"
            className="flex-row items-center gap-x-1">
            {editStatus === 'reply' ? (
              <BubbleChatFill width={16} height={16} />
            ) : (
              <BubbleChat width={16} height={16} color="#667085" />
            )}
            <Text
              className={cn(
                'text-sm',
                editStatus === 'reply' ? 'text-secondary-500' : 'text-gray-500',
              )}>
              대댓글
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
        onRemove={() => removeComment({id: Number(comment.id)})}
      />
    </View>
  );
}
