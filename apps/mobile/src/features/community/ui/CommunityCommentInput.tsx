import React, {useState} from 'react';
import {Pressable, View} from 'react-native';
import {Text, TextInput} from '@/shared/components/ui/Text/AppText';

import {cn} from '@/shared/lib/styling';
import {useColors} from '@/shared/theme/useColors';

const MAX_COMMENT_LENGTH = 300; // web textarea maxLength
const MAX_INPUT_HEIGHT = 100; // web max-h-[100px]

/**
 * 글 하단 댓글 입력창. web `CommunityCommentSection` 의 CommentInput 대응.
 *
 * ★비로그인 분기(placeholder "로그인 후 댓글을 달 수 있어요.")는 옮기지 않았다 —
 * `RootNavigator` 가 앱 전체를 로그인 뒤에 두므로 이 화면에 비로그인으로
 * 도달할 수 없다(알림 탭 전환 때와 같은 판정).
 */
export default function CommunityCommentInput({
  onSubmit,
  isPending,
}: {
  /** 성공했을 때만 `clear` 를 부른다 — 실패하면 쓴 글이 그대로 남아야 한다. */
  onSubmit: (content: string, clear: () => void) => void;
  isPending: boolean;
}) {
  const c = useColors();
  const [value, setValue] = useState('');

  const canSubmit = value.trim().length > 0 && !isPending;

  const submit = () => {
    const content = value.trim();
    if (!content || isPending) return;
    onSubmit(content, () => {
      setValue('');
    });
  };

  return (
    <View className="flex-row items-end border-t border-gray-300 bg-white px-5 py-3">
      <TextInput
        value={value}
        onChangeText={setValue}
        multiline
        maxLength={MAX_COMMENT_LENGTH}
        placeholder="댓글을 입력해주세요."
        placeholderTextColor={c.gray[500]}
        className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-900"
        // web 은 textarea scrollHeight 로 늘린다. RN 은 multiline 이 내용만큼 스스로 커지니 위아래만 막는다.
        // (onContentSizeChange 로 height 를 직접 계산하던 방식은 여러 줄을 쳐도 40pt 에
        // 갇혀 윗줄이 잘렸다(iOS 26 시뮬 실측). 패딩도 두 번 더해 빈 칸이 52~56pt 로 떴다.)
        style={{minHeight: 40, maxHeight: MAX_INPUT_HEIGHT}}
        accessibilityLabel="댓글 입력"
      />
      <Pressable
        onPress={submit}
        disabled={!canSubmit}
        accessibilityRole="button"
        accessibilityLabel="댓글 등록"
        style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
        className={cn(
          'ml-3 h-10 justify-center rounded-lg px-5',
          canSubmit ? 'bg-gray-800' : 'bg-gray-400',
        )}>
        <Text className="text-sm font-semibold text-white">등록</Text>
      </Pressable>
    </View>
  );
}
