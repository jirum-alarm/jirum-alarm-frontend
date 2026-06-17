import { cva } from 'class-variance-authority';

export const toastVariant = cva('', {
  variants: {
    variant: {
      default:
        'fixed justify-center text-center typography-body-14m rounded-[8px] bg-surface-inverse-muted text-fg-inverse py-[10px] w-[280px] bottom-[84px] left-1/2 -translate-x-1/2 px-5 z-40',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
