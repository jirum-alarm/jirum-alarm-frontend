import React, { isValidElement, useEffect, useId, useMemo, useRef, useState } from 'react';
import { selectButtonVaraint, selectListContainerVariant } from './variant/select';
import { type VariantProps } from 'class-variance-authority';
import { ArrowDown } from '../icons';
import { cn } from '@/lib/cn';
import { SelectContext } from './context/SelectContext';
import useOutsideClick from '@/hooks/useOutsideClick';

interface SelectProps
  extends Omit<
      React.SelectHTMLAttributes<HTMLSelectElement>,
      'size' | 'color' | 'onChange' | 'value' | 'defaultValue'
    >,
    VariantProps<typeof selectButtonVaraint> {
  children: React.ReactNode;
  placeholder: string;
  defaultValue?: string | null;
  onChange?: (value?: string | null) => void;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedOffsetTop, setSelectedOffsetTop] = useState(0);
  const selectId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);

  useOutsideClick(containerRef, () => {
    onCloseOptionList();
  });

  const toggleOptionList = () => {
    setIsExpanded((expanded) => !expanded);
  };

  const onSetSelectedIndex = (index: number) => {
    setSelectedIndex(index);
  };

  const onSetSelectedOffsetTop = (top: number) => {
    setSelectedOffsetTop(top);
  };

  const onCloseOptionList = () => {
    setIsExpanded(false);
  };

  const selectcontextValue = React.useMemo(
    () => ({
      selectedIndex,
      setSelectedIndex: onSetSelectedIndex,
      onChange: onChange ?? (() => {}),
      onClose: onCloseOptionList,
      selectedOffsetTop,
      setSelectedOffsetTop: onSetSelectedOffsetTop,
    }),
    [onChange, selectedIndex, selectedOffsetTop],
  );

  const buttonTextRenderer = () => {
    if (selectedIndex > 0) {
      return (children as any[])?.[selectedIndex - 1].props.children;
    } else {
      return placeholder;
    }
  };

  const SelectOptions = useMemo(
    () =>
      React.Children.map(children, (child, index) => {
        if (!isValidElement(child)) return;

        if (child.props.value === defaultValue) {
          setSelectedIndex(index + 1);
        }
        return React.cloneElement(child, {
          ...child?.props,
          index: child.props?.index || index + 1,
        });
      }),
    [children, defaultValue],
  );

  useEffect(() => {
    if (!isExpanded) return;
    const ul = ulRef.current;
    if (ul) {
      const halfHeight = ul.offsetHeight / 2;
      ul.scrollTop = selectedOffsetTop - halfHeight;
    }
  }, [isExpanded, selectId, selectedOffsetTop]);

  return (
    <SelectContext.Provider value={selectcontextValue}>
      <div className="relative w-full" ref={containerRef}>
        <button
          type="button"
          role="combobox"
          aria-controls={selectId}
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
            ref={ulRef}
            role="listbox"
            id={selectId}
            className={selectListContainerVariant({ size, expanded: isExpanded })}
          >
            {SelectOptions}
          </ul>
        )}
      </div>
    </SelectContext.Provider>
  );
};
