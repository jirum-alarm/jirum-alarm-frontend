import { cva } from 'class-variance-authority'

export const toastVariant = cva('', {
  variants: {
    variant: {
      default: 'grid justify-center rounded-3xl bg-gray-500 text-white py-[10px] w-60',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})
