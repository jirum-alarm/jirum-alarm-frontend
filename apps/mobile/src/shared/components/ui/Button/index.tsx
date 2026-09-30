import React, {isValidElement} from 'react';
import {type VariantProps} from 'class-variance-authority';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
  Text,
} from 'react-native';
import {cn} from '@/shared/lib/styling';
import {
  buttonVaraint,
  textVariant,
} from '@/shared/components/ui/Button/variant/button.ts';

interface ButtonProps
  extends PressableProps,
    VariantProps<typeof buttonVaraint> {
  children?: React.ReactNode;
  loading?: boolean;
}

// 라벨 색과 같게 — 흰 스피너는 lime·error-50 배경에서 안 보였다.
const SPINNER_COLOR = {
  primary: '#101828',
  secondary: '#344054',
  error: '#BC0017',
} as const;

const Button = ({
  children,
  size = 'lg',
  variant = 'filled',
  color = 'primary',
  loading,
  disabled,
  className,
  ...rest
}: ButtonProps) => {
  return (
    <Pressable
      // 로딩 중 재탭 = 이중 제출(탈퇴·신고)이라 막는다.
      disabled={disabled || loading}
      className={cn(buttonVaraint({size, variant, color}), className)}
      // 로딩 중엔 글자가 스피너로 바뀌어 읽을 게 사라지므로 문자열 children 을 라벨로 둔다.
      // 호출부가 넘긴 값이 우선하도록 rest 를 뒤에 편다.
      accessibilityRole="button"
      accessibilityLabel={typeof children === 'string' ? children : undefined}
      accessibilityState={{disabled: !!(disabled || loading), busy: !!loading}}
      {...rest}>
      {({pressed}) => {
        return loading ? (
          <ActivityIndicator
            size="small"
            color={SPINNER_COLOR[color ?? 'primary']}
          />
        ) : isValidElement(children) ? (
          children
        ) : (
          <Text
            className={cn(
              textVariant({size, color, variant, disabled, pressed}),
            )}>
            {children}
          </Text>
        );
      }}
    </Pressable>
  );
};

export default Button;
