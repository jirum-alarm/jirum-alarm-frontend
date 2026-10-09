import React, {isValidElement} from 'react';
import {ActivityIndicator, Pressable, type PressableProps} from 'react-native';
import {button, buttonTone} from '@jirum/design-system/recipes';
import {Text} from '@/shared/components/ui/Text/AppText';
import {cn} from '@/shared/lib/styling';
import {useColors} from '@/shared/theme/useColors';
import {fixed} from '@jirum/design-system';

interface ButtonProps extends PressableProps {
  /** lg = 화면 아래 주 버튼(48px·가득), md·sm = 작은 버튼(주 버튼이면 짙은 판 + 라임 글자) */
  size?: 'lg' | 'md' | 'sm';
  variant?: 'filled' | 'outlined';
  color?: 'primary' | 'secondary' | 'error';
  className?: string;
  children?: React.ReactNode;
  loading?: boolean;
}

/**
 * 모양은 @jirum/design-system recipes 의 button — web Button 과 같은 값·같은 모양 고르기(buttonTone).
 * 누르면 면이 진해진다(active:). 글자는 자식 Text 라 부모의 disabled: 를 못 받아 disabled 일 때 직접 붙인다.
 */
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
  const c = useColors();
  const tone: {
    box: string;
    text: string;
    disabledBox?: string;
    disabledText?: string;
  } = button.tone[buttonTone(variant, color, size)];
  // 라벨 색과 같게 — 흰 스피너는 lime·error-50 배경에서 안 보였다. primary 는 라임 위라 테마 무관 짙은 색(fixed).
  const spinnerColor = {
    primary: size === 'lg' ? fixed[900] : c.primary[500],
    secondary: c.gray[700],
    error: c.error[600],
  }[color];
  return (
    <Pressable
      // 로딩 중 재탭 = 이중 제출(탈퇴·신고)이라 막는다.
      disabled={disabled || loading}
      className={cn(
        'items-center justify-center',
        button.size[size].box,
        tone.box,
        disabled && tone.disabledBox,
        className,
      )}
      // 로딩 중엔 글자가 스피너로 바뀌어 읽을 게 사라지므로 문자열 children 을 라벨로 둔다.
      // 호출부가 넘긴 값이 우선하도록 rest 를 뒤에 편다.
      accessibilityRole="button"
      accessibilityLabel={typeof children === 'string' ? children : undefined}
      accessibilityState={{disabled: !!(disabled || loading), busy: !!loading}}
      {...rest}>
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : isValidElement(children) ? (
        children
      ) : (
        <Text
          className={cn(
            button.size[size].text,
            tone.text,
            disabled && tone.disabledText,
          )}>
          {children}
        </Text>
      )}
    </Pressable>
  );
};

export default Button;
