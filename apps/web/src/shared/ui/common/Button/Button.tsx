'use client';
import { button, buttonTone } from '@jirum/design-system/recipes';
import { type HTMLMotionProps, m } from 'motion/react';

import { cn } from '@/shared/lib/cn';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  /** lg = 화면 아래 주 버튼(48px·가득), md·sm = 작은 버튼(주 버튼이면 짙은 판 + 라임 글자) */
  size?: 'lg' | 'md' | 'sm';
  variant?: 'filled' | 'outlined';
  color?: 'primary' | 'secondary' | 'error';
  children?: React.ReactNode;
}

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
  const tone: { box: string; text: string; disabledBox?: string; disabledText?: string } =
    button.tone[buttonTone(variant, color, size)];
  return (
    <m.button
      {...rest}
      type={rest.type ?? 'button'}
      className={cn(
        button.size[size].box,
        button.size[size].text,
        tone.box,
        tone.text,
        rest.disabled && [tone.disabledBox, tone.disabledText],
        className,
      )}
      whileTap={rest.disabled ? undefined : { scale: 0.95 }}
      transition={{ duration: 0.1 }}
    >
      {children}
    </m.button>
  );
};

Button.displayName = 'Button';
