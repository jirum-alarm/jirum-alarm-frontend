import React, {useEffect, useRef, useState} from 'react';
import {Pressable, View} from 'react-native';
import {Text, TextInput} from '@/shared/components/ui/Text/AppText';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import {CommentService} from '@/shared/api/comment/comment.service';
import {CommentQueries} from '@/entities/comment/comment.queries';
import {
  clearEditingComment,
  useEditingComment,
} from '@/entities/comment/editing-comment';
import {showToast} from '@/shared/lib/feedback';
import Close from '@/shared/components/icons/Close';
import {useColors} from '@/shared/theme/useColors';

const MAX_INPUT_HEIGHT = 120;

export default function CommentInput({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const c = useColors();
  const queryClient = useQueryClient();
  const editing = useEditingComment();
  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = useState('');

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: CommentQueries.keys.list(productId),
    });

  const onSuccess = () => {
    setValue('');
    clearEditingComment();
    invalidate();
  };

  const {mutate: addComment, isPending: isAdding} = useMutation({
    mutationFn: CommentService.addComment,
    onSuccess,
    onError: () => showToast.error('댓글을 등록하지 못했어요.'),
  });
  const {mutate: updateComment, isPending: isUpdating} = useMutation({
    mutationFn: CommentService.updateComment,
    onSuccess,
    onError: () => showToast.error('댓글을 수정하지 못했어요.'),
  });

  // 수정이면 기존 내용을 채우고, 답글이면 빈 칸으로 시작한다.
  // web 은 포커스를 setTimeout(1000) 으로 맞추는데, RN 은 ref.focus() 가
  // 즉시 먹으므로 그 해킹이 필요 없다.
  useEffect(() => {
    if (!editing) {
      setValue('');
      return;
    }
    setValue(editing.status === 'update' ? editing.comment.content ?? '' : '');
    inputRef.current?.focus();
  }, [editing]);

  const handleSubmit = () => {
    const content = value.trim();
    if (!content) return;
    if (!isUserLogin) {
      showToast.info('로그인 후 이용해주세요.');
      return;
    }

    if (editing?.status === 'update') {
      updateComment({id: Number(editing.comment.id), content});
    } else if (editing?.status === 'reply') {
      addComment({productId, content, parentId: Number(editing.comment.id)});
    } else {
      addComment({productId, content});
    }
  };

  const isPending = isAdding || isUpdating;
  const canSubmit = value.trim().length > 0 && !isPending;

  return (
    <View className="border-t border-gray-100 bg-white">
      {editing ? (
        <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-2">
          <Text className="shrink text-sm text-gray-600" numberOfLines={1}>
            {editing.status === 'update' ? '댓글 수정 중' : '답글 작성 중'}
            {editing.comment.author?.nickname
              ? ` · ${editing.comment.author.nickname}`
              : ''}
          </Text>
          <Pressable
            onPress={clearEditingComment}
            // 16px 아이콘이라 12씩 넓혀야 40pt 남짓이 된다.
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="취소">
            <Close width={16} height={16} color={c.gray[500]} />
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row items-end gap-x-2 px-5 py-2">
        <TextInput
          ref={inputRef}
          className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-base text-gray-900"
          multiline
          value={value}
          onChangeText={setValue}
          // web 은 textarea scrollHeight 로 늘린다. RN 은 multiline 이 내용만큼 스스로 커지니 위아래만 막는다.
          // (onContentSizeChange 로 height 를 직접 계산하던 방식은 여러 줄을 쳐도 40pt 에
          // 갇혀 윗줄이 잘렸다(iOS 26 시뮬 실측). 패딩도 두 번 더해 빈 칸이 52~56pt 로 떴다.)
          style={{minHeight: 40, maxHeight: MAX_INPUT_HEIGHT}}
          placeholder={
            isUserLogin ? '댓글을 입력해주세요' : '로그인 후 이용해주세요'
          }
          placeholderTextColor={c.gray[500]}
          editable={isUserLogin}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          // h-10(40px) → 44pt 권장 터치 영역.
          hitSlop={4}
          className="h-10 justify-center px-2">
          <Text
            className={
              canSubmit
                ? 'text-base font-semibold text-primary-800'
                : 'text-base font-semibold text-gray-400'
            }>
            등록
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
