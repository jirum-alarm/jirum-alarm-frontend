import { cva } from 'class-variance-authority';

export const toastVariant = cva('', {
  variants: {
    variant: {
      default:
        'fixed justify-center text-center text-sm font-medium rounded-[8px] bg-gray-600 text-white py-[10px] w-[280px] bottom-[84px] left-1/2 -translate-x-1/2 px-5 z-40',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
