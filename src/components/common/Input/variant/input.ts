import { cva } from 'class-variance-authority';

export const containerVaraint = cva(['relative', 'w-full', 'min-w-[200px]'], {
  variants: {
    size: {
      md: ['h-11'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export const iconVaraint = cva(['absolute'], {
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
    'outline',
    'outline-0',
    'focus:outline-0',
  ],
  {
    variants: {
      variant: {
        standard: ['border-b', 'placeholder:text-gray-400', 'rounded-none'],
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
      true: ['text-error-500'],
      false: ['text-gray-400'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});
