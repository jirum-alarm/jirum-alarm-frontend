import {type CxOptions, cx} from 'class-variance-authority';
import {twMerge} from 'tailwind-merge';

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
