import { cva } from 'class-variance-authority';

export const toastVariant = cva('', {
  variants: {
    variant: {
      default:
        'fixed grid justify-center rounded-3xl bg-gray-500 text-white py-[10px] w-60 bottom-8 left-1/2 -translate-x-1/2 px-3',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
