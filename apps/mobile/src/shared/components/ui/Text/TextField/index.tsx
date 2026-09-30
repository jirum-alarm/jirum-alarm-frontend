import React, {forwardRef, isValidElement, useState} from 'react';
import {type TextInputProps, View} from 'react-native';
import {Text, TextInput} from '@/shared/components/ui/Text/AppText';
import {
  containerVaraint,
  textfieldVariant,
} from '@/shared/components/ui/Text/TextField/variant/textfield.ts';
import type {VariantProps} from 'class-variance-authority';
import {cn} from '@/shared/lib/styling';
import {composeEventHandlers} from '@/shared/lib/ui';

interface Props extends TextInputProps, VariantProps<typeof textfieldVariant> {
  label?: string;
  suffixIcon?: React.ReactNode;
  helperText?: string | React.ReactNode;
}

const TextField = forwardRef<TextInput, Props>(
  (
    {
      variant = 'standard',
      size = 'md',
      color = 'black',
      error = false,
      label,
      helperText,
      suffixIcon,
      onFocus,
      onBlur,
      className,
      ...rest
    },
    ref,
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const handleFocused = () => {
      setIsFocused(true);
    };
    const handleBlur = () => {
      setIsFocused(false);
    };

    // onPress 없는 Pressable 로 감싸면 iOS 가 라벨·입력·버튼을 요소 하나로 묶었다 → View.
    return (
      <View>
        {label && (
          <View className="mb-[8px]">
            <Text className="text-gray-500 text-[14px] font-semibold">
              {label}
            </Text>
          </View>
        )}
        <View className={cn(containerVaraint({variant, focused: isFocused}))}>
          <TextInput
            ref={ref}
            // 화면 라벨이 입력칸 밖 Text 라 스크린리더가 연결하지 못한다. 호출부 값이 우선.
            accessibilityLabel={label}
            {...rest}
            numberOfLines={1}
            autoCapitalize="none" // 자동 대문자 방지
            spellCheck={false} // 입력중 철자 검사
            autoCorrect={false} //입력중 자동 수정 기능
            onFocus={composeEventHandlers(handleFocused, onFocus)}
            onBlur={composeEventHandlers(handleBlur, onBlur)}
            selectionColor={'#000000'}
            placeholderTextColor={'#667085'}
            className={cn(textfieldVariant({variant, size, color}), className)}
          />
          {suffixIcon && <View className="pr-[8px]">{suffixIcon}</View>}
        </View>
        {helperText && (
          <View className="mt-[8px]">
            {isValidElement(helperText) ? (
              helperText
            ) : (
              <Text
                className={cn('text-[12px] font-pretendard', {
                  'text-error-500': error,
                  'text-gray-500': !error,
                })}>
                {helperText}
              </Text>
            )}
          </View>
        )}
      </View>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
