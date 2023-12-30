import { cva } from 'class-variance-authority'

export const optionVaraint = cva(['w-full', 'cursor-pointer'], {
  variants: {
    size: {
      md: ['py-3', 'px-5', 'text-base', 'h-full'],
    },
    color: {
      black: ['text-gray-900', 'hover:bg-gray-100'],
    },
    active: {
      true: [''],
    },
  },
  compoundVariants: [
    {
      color: ['black'],
      active: [true],
      class: 'bg-gray-100',
    },
  ],
  defaultVariants: {
    color: 'black',
    size: 'md',
  },
})
