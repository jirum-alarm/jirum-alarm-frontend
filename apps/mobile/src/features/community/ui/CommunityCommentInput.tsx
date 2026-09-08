import React, {useState} from 'react';
import {Pressable, Text, TextInput, View} from 'react-native';

import {cn} from '@/shared/lib/styling';

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
  onSubmit: (content: string) => void;
  isPending: boolean;
}) {
  const [value, setValue] = useState('');
  const [height, setHeight] = useState(0);

  const canSubmit = value.trim().length > 0 && !isPending;

  const submit = () => {
    const content = value.trim();
    if (!content || isPending) return;
    onSubmit(content);
    setValue('');
    setHeight(0);
  };

  return (
    <View className="flex-row items-end border-t border-gray-300 bg-white px-5 py-3">
      <TextInput
        value={value}
        onChangeText={setValue}
        multiline
        maxLength={MAX_COMMENT_LENGTH}
        placeholder="댓글을 입력해주세요."
        placeholderTextColor="#98A2B3"
        className="flex-1 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-900"
        // web 은 textarea scrollHeight 로 늘린다. RN 대응이 이것.
        style={{height: Math.min(Math.max(40, height), MAX_INPUT_HEIGHT)}}
        onContentSizeChange={e =>
          setHeight(e.nativeEvent.contentSize.height + 16)
        }
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
