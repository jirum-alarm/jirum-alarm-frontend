import { VariantProps } from 'class-variance-authority'
import { optionVaraint } from './variant/option'
import { cn } from '@/lib/cn'
import { useSelectContext } from './context/SelectContext'
import { useEffect } from 'react'

interface OptionProps
  extends Omit<
      React.SelectHTMLAttributes<HTMLSelectElement>,
      'size' | 'color' | 'onChange' | 'value'
    >,
    VariantProps<typeof optionVaraint> {
  children: React.ReactNode
  index?: number
  value?: string
}

export const Option = ({ size, color, children, index, value, className }: OptionProps) => {
  const { onChange, onClose, setSelectedIndex, selectedIndex } = useSelectContext()
  const handleOptionClick = () => {
    index && setSelectedIndex(index)
    value && onChange(value)
    onClose()
  }

  return (
    <li
      role="option"
      aria-selected={index === selectedIndex}
      className={cn(optionVaraint({ size, color, active: index === selectedIndex }), className)}
      onClick={handleOptionClick}
    >
      {children}
    </li>
  )
}
