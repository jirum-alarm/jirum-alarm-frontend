import React from 'react'
import { input } from './theme/input'
import { clsx } from 'clsx'
import { objectsToString } from '@/util/object'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'standard'
  size?: 'md'
  error?: string | boolean
  color?: 'black'
  icon?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'standard',
      size = 'md',
      error = false,
      color = 'black',
      icon,
      ...rest
    }: InputProps,
    ref,
  ) => {
    // 1. init
    const { styles } = input
    const { base, variants } = styles

    // 2. set styles
    const inputVariant = variants[variant]
    const inputSize = inputVariant.sizes[size]
    const inputError = objectsToString(inputVariant.error.input)
    const inputColor = objectsToString(inputVariant.colors.input[color])

    // 3. set classes
    const containerClasses = clsx(
      objectsToString(base.container),
      objectsToString(inputSize.container),
    )

    const inputClasses = clsx(
      objectsToString(base.input),
      objectsToString(inputVariant.base.input),
      objectsToString(inputSize.input),
      { [objectsToString(inputVariant.base.inputWithIcon)]: icon },
      inputColor,
    )

    const iconClasses = clsx(
      objectsToString(base.icon),
      objectsToString(inputVariant.base.icon),
      objectsToString(inputSize.icon),
    )

    const errorClasses = clsx(objectsToString(inputSize.error), { [inputError]: !!error })

    return (
      <div className={containerClasses}>
        {icon && <div className={iconClasses}>{icon}</div>}
        <input {...rest} ref={ref} className={inputClasses} />
        {error && <span className={errorClasses}>{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
