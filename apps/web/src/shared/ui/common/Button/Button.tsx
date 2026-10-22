'use client';
import { button, buttonTone } from '@jirum/design-system/recipes';
import { type HTMLMotionProps } from 'motion/react';
import * as m from 'motion/react-m';

import { cn } from '@/shared/lib/cn';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  /** lg = 화면 아래 주 버튼(48px·가득), md·sm = 작은 버튼(주 버튼이면 짙은 판 + 라임 글자) */
  size?: 'lg' | 'md' | 'sm';
  variant?: 'filled' | 'outlined';
  color?: 'primary' | 'secondary' | 'error';
  children?: React.ReactNode;
}

interface ButtonShape {
  /** lg = 화면 아래 주 버튼(48px·가득), md·sm = 작은 버튼(주 버튼이면 짙은 판 + 라임 글자) */
  size?: 'lg' | 'md' | 'sm';
  variant?: 'filled' | 'outlined';
  color?: 'primary' | 'secondary' | 'error';
  disabled?: boolean;
}

/**
 * Button 과 같은 모양을 Link·<a>·OpenInAppLink 에 걸 때 — 버튼 모양을 자리마다 손으로 다시 적지 않게.
 * 눌림은 레시피의 active:(면이 한 단계 진해짐)까지만 온다. 줄어드는 움직임은 Button(또는 m.span whileTap)이 더한다.
 */
export const buttonClass = ({
  size = 'lg',
  variant = 'filled',
  color = 'primary',
  disabled,
}: ButtonShape = {}) => {
  const tone: { box: string; text: string; disabledBox?: string; disabledText?: string } =
    button.tone[buttonTone(variant, color, size)];
  return cn(
    button.size[size].box,
    button.size[size].text,
    tone.box,
    tone.text,
    disabled && [tone.disabledBox, tone.disabledText],
  );
};

/**
 * 모양은 @jirum/design-system recipes 의 button — 앱 Button 과 같은 값·같은 모양 고르기(buttonTone).
 * 누르면 면이 진해지고(active:) 살짝 줄어든다. 비활성은 disabled 일 때 disabledBox·disabledText 를 더한다.
 */
export const Button = ({
  size = 'lg',
  variant = 'filled',
  color = 'primary',
  className,
  children,
  ...rest
}: ButtonProps) => {
  return (
    <m.button
      {...rest}
      type={rest.type ?? 'button'}
      className={cn(buttonClass({ size, variant, color, disabled: !!rest.disabled }), className)}
      whileTap={rest.disabled ? undefined : { scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </m.button>
  );
};

Button.displayName = 'Button';
