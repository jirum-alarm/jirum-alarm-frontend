import React, {useState} from 'react';
import {Pressable, StyleSheet, Text, TextInput, View} from 'react-native';

import Dots from '@/shared/components/icons/Dots';
import ThumbsupFill from '@/shared/components/icons/ThumbsupFill';
import {displayTime} from '@/shared/lib/format/price';
import {cn} from '@/shared/lib/styling';
import type {CommunityComment} from '@/shared/api/community';

import CommunitySheet from './CommunitySheet';
import ConfirmSheet from './ConfirmSheet';
import SheetMenuRow from './SheetMenuRow';
import {gaps} from './community-styles';

const MAX_COMMENT_LENGTH = 300; // web textarea maxLength

/**
 * 글에 달린 댓글 한 줄. web `CommunityCommentSection` 의 CommentItem 대응.
 *
 * ★수정은 **이 자리에서** 한다(web 과 같다) — 하단 입력창을 재사용하는
 * 상품 댓글(`features/comment`)과 규칙이 다르다. 커뮤니티는 글 본문이 위에
 * 길게 있어서, 목록 끝 입력창으로 올라가면 무엇을 고치는지 안 보인다.
 *
 * 편집 중인 댓글이 무엇인지는 **화면이** 들고 있다 — FlatList 는 행을
 * 재활용할 수 있어서 행이 자기 편집 상태를 들면 스크롤에 날아간다.
 */
export default function CommunityCommentItem({
  comment,
  isMyComment,
  isEditing,
  isUpdating,
  onStartEdit,
  onCancelEdit,
  onSubmitEdit,
  onRemove,
  onLike,
}: {
  comment: CommunityComment;
  isMyComment: boolean;
  isEditing: boolean;
  isUpdating: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSubmitEdit: (content: string) => void;
  onRemove: () => void;
  onLike: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [draft, setDraft] = useState(comment.content);

  if (isEditing) {
    return (
      <View className="px-5 py-3" style={gaps.g8}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          maxLength={MAX_COMMENT_LENGTH}
          multiline
          autoFocus
          className="rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900"
          style={styles.editInput}
          accessibilityLabel="댓글 수정"
        />
        <View className="flex-row justify-end" style={gaps.g8}>
          <Pressable
            onPress={onCancelEdit}
            accessibilityRole="button"
            style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
            className="h-8 justify-center rounded-lg bg-gray-100 px-4">
            <Text className="text-sm font-medium text-gray-700">취소</Text>
          </Pressable>
          <Pressable
            onPress={() => onSubmitEdit(draft.trim())}
            disabled={!draft.trim() || isUpdating}
            accessibilityRole="button"
            style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
            className={cn(
              'h-8 justify-center rounded-lg px-4',
              !draft.trim() || isUpdating ? 'bg-gray-400' : 'bg-gray-800',
            )}>
            <Text className="text-sm font-semibold text-white">수정</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="px-5 py-3">
      <View className="flex-row items-start justify-between">
        <View className="flex-row items-center" style={gaps.g8}>
          <Text className="text-sm font-medium text-gray-700">
            {comment.author?.nickname ?? '알 수 없음'}
          </Text>
          <Text className="text-xs text-gray-500">
            {displayTime(comment.createdAt)}
          </Text>
        </View>
        {isMyComment ? (
          <Pressable
            onPress={() => setMenuOpen(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="댓글 메뉴">
            <Dots width={20} height={20} />
          </Pressable>
        ) : null}
      </View>

      <Text className="pt-1 text-sm text-gray-900">{comment.content}</Text>

      <View className="flex-row items-center pt-2">
        <Pressable
          onPress={onLike}
          accessibilityRole="button"
          accessibilityLabel="좋아요"
          style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
          className="flex-row items-center"
          hitSlop={6}>
          <ThumbsupFill width={14} height={14} active={!!comment.isMyLike} />
          <Text
            className={cn(
              'pl-1 text-xs',
              comment.isMyLike ? 'text-primary-700' : 'text-gray-500',
            )}>
            좋아요 {comment.likeCount}
          </Text>
        </Pressable>
      </View>

      <CommunitySheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        accessibilityLabel="댓글 메뉴">
        <View className="pb-4">
          <SheetMenuRow
            label="댓글 수정하기"
            onPress={() => {
              setMenuOpen(false);
              setDraft(comment.content);
              onStartEdit();
            }}
          />
          <View className="mx-5 h-px bg-gray-200" />
          <SheetMenuRow
            label="댓글 삭제하기"
            tone="danger"
            onPress={() => {
              setMenuOpen(false);
              setConfirmOpen(true);
            }}
          />
        </View>
      </CommunitySheet>

      <ConfirmSheet
        visible={confirmOpen}
        title="댓글을 삭제할까요?"
        description="댓글을 삭제하면 다시 복구할 수 없어요."
        confirmLabel="삭제"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          onRemove();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  /** 수정 입력칸. web textarea rows=2 대응 높이. */
  editInput: {
    minHeight: 64,
    textAlignVertical: 'top',
  },
});
