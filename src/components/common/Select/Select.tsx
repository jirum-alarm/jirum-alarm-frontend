import React, { isValidElement, useId, useMemo, useState } from 'react'
import { selectButtonVaraint, selectListContainerVariant } from './variant/select'
import { type VariantProps } from 'class-variance-authority'
import { ArrowDown } from '../icons'
import { cn } from '@/lib/cn'
import { SelectContext } from './context/SelectContext'

interface SelectProps
  extends Omit<
      React.SelectHTMLAttributes<HTMLSelectElement>,
      'size' | 'color' | 'onChange' | 'value'
    >,
    VariantProps<typeof selectButtonVaraint> {
  children: React.ReactNode
  placeholder: string
  defaultValue?: string
  onChange?: (value: string) => void
}

export const Select = ({
  size,
  color,
  className,
  children,
  placeholder,
  onChange,
  defaultValue,
}: SelectProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const selectId = useId()
  const toggleOptionList = () => {
    setIsExpanded((expanded) => !expanded)
  }

  const onSetSelectedIndex = (index: number) => {
    setSelectedIndex(index)
  }

  const onCloseOptionList = () => {
    setIsExpanded(false)
  }

  const selectcontextValue = React.useMemo(
    () => ({
      selectedIndex,
      setSelectedIndex: onSetSelectedIndex,
      onChange: onChange ?? (() => {}),
      onClose: onCloseOptionList,
    }),
    [onChange, selectedIndex],
  )

  const buttonTextRenderer = () => {
    if (selectedIndex > 0) {
      return (children as any[])?.[selectedIndex - 1].props.children
    } else {
      return placeholder
    }
  }

  const SelectOptions = useMemo(
    () =>
      React.Children.map(children, (child, index) => {
        if (!isValidElement(child)) return
        if (child.props.value && child.props.value === defaultValue) {
          setSelectedIndex(index + 1)
        }
        return React.cloneElement(child, {
          ...child?.props,
          index: child.props?.index || index + 1,
        })
      }),
    [children, defaultValue],
  )

  return (
    <SelectContext.Provider value={selectcontextValue}>
      <div className="relative w-full">
        <button
          type="button"
          role="combobox"
          aria-controls={`select-option-${selectId}`}
          aria-expanded={isExpanded}
          aria-haspopup="listbox"
          className={cn(selectButtonVaraint({ size, color }), className)}
          onClick={toggleOptionList}
        >
          <span>{buttonTextRenderer()}</span>
          <ArrowDown className={cn(' transition-transform', { 'rotate-180': isExpanded })} />
        </button>
        {isExpanded && (
          <ul
            role="listbox"
            id={`select-option-${selectId}`}
            className={selectListContainerVariant({ size, expanded: isExpanded })}
          >
            {SelectOptions}
          </ul>
        )}
      </div>
    </SelectContext.Provider>
  )
}
