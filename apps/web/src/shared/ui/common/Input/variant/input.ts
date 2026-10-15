import { cva } from 'class-variance-authority';

export const containerVariant = cva(['relative', 'w-full', 'min-w-[200px]'], {
  variants: {
    size: {
      md: ['h-11'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const iconVariant = cva(['absolute'], {
  variants: {
    variant: {
      standard: ['top-2/4', 'right-2', '-translate-y-1/2'],
    },
    size: {
      md: ['w-5', 'h-5'],
    },
  },
  defaultVariants: {
    variant: 'standard',
    size: 'md',
  },
});

export const inputVariant = cva(
  [
    'peer',
    'w-full',
    'h-full',
    'bg-transparent',
    'font-normal',
    'outline-solid',
    'outline-0',
    'focus:outline-0',
  ],
  {
    variants: {
      variant: {
        standard: ['border-b', 'placeholder:text-gray-500', 'rounded-none'],
      },
      size: {
        md: ['text-base', 'px-1', 'py-3'],
      },
      color: {
        black: ['text-gray-900', 'border-gray-400', 'focus:border-gray-900'],
      },
    },

    defaultVariants: {
      variant: 'standard',
      size: 'md',
      color: 'black',
    },
  },
);

export const errorVariant = cva('', {
  variants: {
    size: {
      md: ['pt-2', 'text-xs'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const helperVariant = cva('', {
  variants: {
    size: {
      md: ['pt-2', 'text-xs'],
    },
    error: {
      // error-500 은 다크 바탕에서 4.1:1(AA 미달) — 600 은 다크에서 밝게 뒤집혀 두 테마 모두 AA.
      true: ['text-error-600'],
      // gray-400 은 흰 바탕 2.58:1(AA 미달) — 보조 글자의 최저선은 gray-500(design-system README 「색」).
      false: ['text-gray-500'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
