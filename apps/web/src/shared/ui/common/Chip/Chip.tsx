import { chip } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import type { ButtonHTMLAttributes } from 'react';

export type ChipProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> & {
  selected?: boolean;
  /** md = 탭(홈·추천), sm = 필터(검색), xs = 하위 탭 */
  size?: keyof typeof chip.size;
  children: string;
};

/**
 * 고르는 칩(필터·탭). 모양은 @jirum/design-system recipes 의 chip — 앱 Chip 과 같은 클래스.
 * ★고르면 글자가 굵어져도 칩 너비는 그대로다: ::after 에 굵은 글자를 높이 0·안 보이게 깔아 너비를 미리 잡는다.
 * 예전엔 고를 때마다 칩이 넓어져 옆 칩이 밀렸다(앱 키워드 칩 "크기가 변해" 지적과 같은 문제).
 * 글자 사본을 DOM 에 두지 않는 이유 — textContent 가 "전체전체"가 되어 GTM 클릭 텍스트·크롤러가 두 번 읽는다.
 */
export const Chip = ({
  selected = false,
  size = 'md',
  className,
  children,
  type = 'button',
  ...rest
}: ChipProps) => {
  const state = selected ? chip.selected : chip.idle;
  return (
    <button
      {...rest}
      type={type}
      aria-pressed={selected}
      className={cn(
        'shrink-0 cursor-pointer transition-all active:scale-95',
        chip.size[size].box,
        state.box,
        chip.size[size].text,
        state.text,
        className,
      )}
    >
      <span
        data-label={children}
        className="flex flex-col items-center after:invisible after:h-0 after:overflow-hidden after:font-semibold after:content-[attr(data-label)]"
      >
        {children}
      </span>
    </button>
  );
};
