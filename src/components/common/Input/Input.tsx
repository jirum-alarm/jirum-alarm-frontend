import React from 'react'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'standard' | 'outlined'
  size?: 'md' | 'lg'
  error?: boolean | string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((props: InputProps, ref) => {
  return (
    <div>
      <input ref={ref} className="text-gray-400" />
    </div>
  )
})
