import React, {forwardRef, isValidElement, useState} from 'react';
import {
  Pressable,
  TextInput,
  Text,
  type TextInputProps,
  View,
} from 'react-native';
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

    return (
      <Pressable>
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
            {...rest}
            numberOfLines={1}
            autoCapitalize="none" // 자동 대문자 방지
            spellCheck={false} // 입력중 철자 검사
            autoCorrect={false} //입력중 자동 수정 기능
            onFocus={composeEventHandlers(handleFocused, onFocus)}
            onBlur={composeEventHandlers(handleBlur, onBlur)}
            selectionColor={'#000000'}
            placeholderTextColor={'#98A2B3'}
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
      </Pressable>
    );
  },
);

TextField.displayName = 'TextField';

export default TextField;
