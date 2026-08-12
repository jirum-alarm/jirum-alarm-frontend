import React, {useEffect, useRef, useState} from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';
import {useMutation, useQueryClient} from '@tanstack/react-query';

import {CommentService} from '@/shared/api/comment/comment.service';
import {CommentQueries} from '@/entities/comment/comment.queries';
import {
  clearEditingComment,
  useEditingComment,
} from '@/entities/comment/editing-comment';
import {showToast} from '@/shared/lib/feedback';

const MAX_INPUT_HEIGHT = 120;

export default function CommentInput({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  const queryClient = useQueryClient();
  const editing = useEditingComment();
  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = useState('');
  const [height, setHeight] = useState(0);

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
  });
  const {mutate: updateComment, isPending: isUpdating} = useMutation({
    mutationFn: CommentService.updateComment,
    onSuccess,
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
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="취소">
            <Text className="text-sm text-gray-500">취소</Text>
          </Pressable>
        </View>
      ) : null}

      <View className="flex-row items-end gap-x-2 px-5 py-2">
        <TextInput
          ref={inputRef}
          className="flex-1 rounded-lg bg-gray-100 px-3 py-2 text-base text-gray-900"
          style={{height: Math.min(Math.max(40, height), MAX_INPUT_HEIGHT)}}
          multiline
          value={value}
          onChangeText={setValue}
          // web 은 textarea scrollHeight 로 늘린다. RN 대응이 이것.
          onContentSizeChange={e =>
            setHeight(e.nativeEvent.contentSize.height + 16)
          }
          placeholder={
            isUserLogin ? '댓글을 입력해주세요' : '로그인 후 이용해주세요'
          }
          placeholderTextColor="#98A2B3"
          editable={isUserLogin}
        />
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          accessibilityRole="button"
          className="h-10 justify-center px-2">
          <Text
            className={
              canSubmit
                ? 'text-base font-semibold text-primary-700'
                : 'text-base font-semibold text-gray-400'
            }>
            등록
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
