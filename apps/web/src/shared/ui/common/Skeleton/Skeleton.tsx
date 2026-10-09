import { skeleton } from '@jirum/design-system/recipes';

import { cn } from '@/shared/lib/cn';

import type { HTMLAttributes } from 'react';

/**
 * 로딩 자리표시 판. 색은 @jirum/design-system recipes 의 skeleton — 앱 SkeletonBox 와 같은 gray-200
 * (gray-100 에 깜빡임까지 겹치면 흰 바탕과 거의 구분이 안 됐다).
 * 크기·모서리는 실제 요소와 맞춰 className 으로 — 어긋나면 데이터가 올 때 레이아웃이 튄다.
 * 깜빡임은 "동작 줄이기"를 켠 사람에겐 멈춘다(motion-safe, 앱 useShimmer 와 같은 규칙).
 */
export const Skeleton = ({ className, ...rest }: HTMLAttributes<HTMLDivElement>) => (
  <div aria-hidden {...rest} className={cn('motion-safe:animate-pulse', skeleton, className)} />
);
