import { toggle } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import type { ButtonHTMLAttributes } from 'react';

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onChange'> & {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
};

/**
 * 켜고 끄는 스위치. 모양은 @jirum/design-system recipes 의 toggle — 앱 Switch 와 같은 44x24.
 * 이름은 옆 `<label htmlFor={id}>` 나 aria-label 로 준다.
 * 예전 모양(hidden checkbox + peer-checked)은 input 이 display:none 이라 키보드·스크린리더가 닿지 못했다.
 */
export const Switch = ({
  checked,
  onCheckedChange,
  className,
  type = 'button',
  ...rest
}: SwitchProps) => (
  <button
    {...rest}
    type={type}
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      'relative shrink-0 cursor-pointer transition-colors disabled:cursor-default disabled:opacity-50',
      toggle.track,
      checked ? toggle.on : toggle.off,
      className,
    )}
  >
    <span
      className={cn(
        'absolute top-0.5 left-0.5 shadow transition-transform',
        toggle.knob,
        checked && 'translate-x-5',
      )}
    />
  </button>
);
