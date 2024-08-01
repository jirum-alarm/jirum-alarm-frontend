import { cva } from 'class-variance-authority';

export const toastVariant = cva('', {
  variants: {
    variant: {
      default:
        'fixed grid justify-center text-center text-sm font-medium rounded-[8px] bg-gray-500 text-white py-[10px] w-[280px] bottom-8 left-1/2 -translate-x-1/2 px-3 z-40',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
