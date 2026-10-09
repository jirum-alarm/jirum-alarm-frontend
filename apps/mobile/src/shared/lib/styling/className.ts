import {twMergeConfig} from '@jirum/design-system';
import {type CxOptions, cx} from 'class-variance-authority';
import {extendTailwindMerge} from 'tailwind-merge';

// 디자인 토큰의 사용자 정의 값(text-13·shadow-card·rounded-t-sheet)을 알려 준다 — 모르면 text-13 을 색으로 보고 지운다.
const twMerge = extendTailwindMerge(twMergeConfig);

/**
 * Merges Tailwind CSS classes with class-variance-authority
 *
 * @param inputs - Class names to merge
 * @returns Merged class string
 *
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 */
export const cn = (...inputs: CxOptions) => {
  return twMerge(cx(inputs));
};
