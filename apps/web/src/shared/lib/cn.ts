import { twMergeConfig } from '@jirum/design-system';
import { cx, type CxOptions } from 'class-variance-authority';
import { extendTailwindMerge } from 'tailwind-merge';

// 디자인 토큰의 사용자 정의 값(text-13·shadow-card·rounded-t-sheet)을 알려 준다 — 모르면 text-13 을 색으로 보고 지운다.
const twMerge = extendTailwindMerge(twMergeConfig);

export const cn = (...inputs: CxOptions) => {
  return twMerge(cx(inputs));
};
