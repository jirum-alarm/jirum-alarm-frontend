import { VariantProps } from 'class-variance-authority';
import { useEffect, useRef } from 'react';

import { cn } from '@/lib/cn';

import { useSelectContext } from './context/SelectContext';
import { optionVaraint } from './variant/option';

export interface OptionProps
  extends
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'color' | 'onChange' | 'value'>,
    VariantProps<typeof optionVaraint> {
  children: React.ReactNode;
  index?: number;
  value?: string | null;
}

export const Option = ({ size, color, children, index = -1, value, className }: OptionProps) => {
  const { onChange, onClose, setSelectedIndex, selectedIndex, setSelectedOffsetTop } =
    useSelectContext();
  const listRef = useRef<HTMLLIElement>(null);
  const handleOptionClick = () => {
    if (index) {
      setSelectedIndex(index);
    }
    onChange(value);
    onClose();
  };

  useEffect(() => {
    if (index === selectedIndex) {
      const li = listRef.current;
      if (!li) return;
      const offsetTop = li.offsetTop;
      const halfOffstHeight = li.offsetHeight / 2;
      setSelectedOffsetTop(offsetTop + halfOffstHeight);
    }
  }, [index, selectedIndex, setSelectedOffsetTop]);

  return (
    <li
      ref={listRef}
      role="option"
      aria-selected={index === selectedIndex}
      className={cn(optionVaraint({ size, color, active: index === selectedIndex }), className)}
      onClick={handleOptionClick}
    >
      {children}
    </li>
  );
};
