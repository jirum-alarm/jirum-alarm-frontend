export interface InputSizeStylesType {
  container: object
  input: object
  icon: object
  error: object
}

export interface InputStateStylesType {
  input: object
}

interface InputVariantStylesType {
  base: {
    input: object
    inputWithIcon: object
    icon: object
  }
  sizes: {
    md: InputSizeStylesType
  }
  colors: {
    input: {
      black: object
    }
  }
  error: InputStateStylesType
}

interface InputStylesType {
  styles: {
    base: {
      container: {
        position: string
        width: string
        minWidth: string
      }
      input: {
        peer: string
        width: string
        height: string
        bg: string
        fontWeight: string
        outline: string
      }
      icon: {
        position: string
      }
    }
    variants: {
      standard: InputVariantStylesType
    }
  }
}

export const input: InputStylesType = {
  styles: {
    base: {
      container: {
        position: 'relative',
        width: 'w-full',
        minWidth: 'min-w-[200px]',
      },
      input: {
        peer: 'peer',
        width: 'w-full',
        height: 'h-full',
        bg: 'bg-transparent',
        fontWeight: 'font-normal',
        outline: 'outline outline-0 focus:outline-0',
      },
      icon: {
        position: 'absolute',
      },
    },
    variants: {
      standard: {
        base: {
          input: {
            borderWidth: 'border-b',
            borderColor: 'placeholder-shown:border-blue-gray-200',
            placeholder: 'placeholder:text-gray-400',
          },
          inputWithIcon: {
            pr: '!pr-10',
          },
          icon: {
            top: 'top-2/4',
            right: 'right-2',
            transform: '-translate-y-1/2',
          },
        },
        sizes: {
          md: {
            container: {
              height: 'h-11',
            },
            input: {
              fontSize: 'text-base',
              py: 'py-3',
              px: 'px-2',
            },
            icon: {
              width: 'w-5',
              height: 'h-5',
            },
            error: {
              fontSize: 'text-xs',
            },
          },
        },
        colors: {
          input: {
            black: {
              color: 'text-gray-900',
              borderColor: 'border-gray-400',
              borderColorFocused: 'focus:border-gray-900',
            },
          },
        },
        error: {
          input: {
            color: 'text-error',
          },
        },
      },
    },
  },
} as const
