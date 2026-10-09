import {cva} from 'class-variance-authority';

export const containerVariant = cva('w-full flex-row items-center', {
  variants: {
    variant: {
      standard: [
        'border-b',
        'focus:border-b-gray-900',
        'border-b-gray-400',
        'rounded-none',
      ],
    },
    focused: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    {
      variant: 'standard',
      focused: true,
      class: 'border-b-gray-900',
    },
  ],
  defaultVariants: {
    variant: 'standard',
  },
});

export const textfieldVariant = cva('flex-1 h-full', {
  variants: {
    variant: {
      standard: '',
    },
    error: {
      true: '',
      false: '',
    },
    size: {
      // eslint-disable-next-line no-restricted-syntax -- TextInput 은 크기만(text-base 의 줄높이 24 를 주면 iOS 한 줄 입력칸 글자가 밀린다)
      md: ['text-[16px]', 'px-[8px]', 'py-[10px]'],
    },
    color: {
      black: ['text-gray-900'],
    },
  },
  defaultVariants: {
    variant: 'standard',
    size: 'md',
    color: 'black',
    error: false,
  },
});
