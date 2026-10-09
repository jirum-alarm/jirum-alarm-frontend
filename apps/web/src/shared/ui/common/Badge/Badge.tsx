import { badge } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import type { HTMLAttributes } from 'react';

type Variants = typeof badge.variant;
type Recipe = { box: string; text: string };
/** variant 마다 쓸 수 있는 tone 이 다르다(solid 는 gray·secondary·error, outline 은 gray 만). 앱 Badge 와 같은 모양. */
type BadgeColor =
  | { variant: 'soft'; tone: keyof Variants['soft'] }
  | { variant: 'solid'; tone: keyof Variants['solid'] }
  | { variant: 'outline'; tone: keyof Variants['outline'] };

export type BadgeProps = Omit<HTMLAttributes<HTMLSpanElement>, 'color'> &
  Partial<BadgeColor> & {
    size?: keyof typeof badge.size;
    /** 판정 배지(역대 최저·평소보다 비싸요)는 알약 모양 — 정보 태그와 모양으로 구분한다. */
    pill?: boolean;
  };

/**
 * 작은 라벨(상태·판정·정보). 누를 수 없다 — 누르는 건 Chip.
 * 모양은 @jirum/design-system recipes 의 badge 라 앱 Badge 와 같은 클래스를 쓴다(두 플랫폼이 어긋나지 않게).
 */
export const Badge = ({
  variant = 'soft',
  tone = 'gray',
  size = 'sm',
  pill = false,
  className,
  ...rest
}: BadgeProps) => {
  const color = (badge.variant[variant] as Record<string, Recipe>)[tone];
  return (
    <span
      {...rest}
      className={cn(
        'inline-flex shrink-0 items-center whitespace-nowrap',
        badge.size[size].box,
        pill && badge.pill.box,
        color.box,
        badge.size[size].text,
        color.text,
        className,
      )}
    />
  );
};
