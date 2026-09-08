import React from 'react';
import {Pressable, Text} from 'react-native';

/**
 * 시트 안의 메뉴 한 줄(글 메뉴·댓글 메뉴 공용).
 * web 의 vaul 시트 안 버튼과 같은 높이(h-14)·타이포.
 */
export default function SheetMenuRow({
  label,
  tone,
  onPress,
}: {
  label: string;
  tone?: 'danger';
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      android_ripple={{color: '#F2F4F7'}}
      style={({pressed}) => (pressed ? {opacity: 0.6} : null)}
      className="h-14 items-center justify-center">
      <Text
        className={
          tone === 'danger'
            ? 'text-error-500 text-lg font-medium'
            : 'text-lg font-medium text-gray-800'
        }>
        {label}
      </Text>
    </Pressable>
  );
}
