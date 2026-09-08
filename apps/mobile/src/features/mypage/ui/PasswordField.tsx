import React, {useState} from 'react';
import {Pressable, Text, View} from 'react-native';

import TextField from '@/shared/components/ui/Text/TextField';
import EyeIcon from '@/shared/components/icons/eye';
import EyeOffIcon from '@/shared/components/icons/eye_off';

/**
 * 비밀번호 입력. web `features/mypage/ui/password/PasswordInput`.
 * 라벨 + 마스킹 토글(눈) + 헬퍼 문구.
 */
export default function PasswordField({
  label,
  placeholder,
  value,
  onChangeText,
  helper,
  autoFocus = false,
  onSubmitEditing,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (next: string) => void;
  helper?: React.ReactNode;
  autoFocus?: boolean;
  onSubmitEditing?: () => void;
}) {
  const [masking, setMasking] = useState(true);

  return (
    <View>
      <Text className="pb-2 text-sm text-gray-500">{label}</Text>
      <TextField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={masking}
        autoFocus={autoFocus}
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={onSubmitEditing}
        suffixIcon={
          <Pressable
            onPress={() => setMasking(prev => !prev)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={masking ? '비밀번호 보기' : '비밀번호 가리기'}>
            {masking ? <EyeOffIcon /> : <EyeIcon />}
          </Pressable>
        }
        helperText={helper}
      />
    </View>
  );
}
