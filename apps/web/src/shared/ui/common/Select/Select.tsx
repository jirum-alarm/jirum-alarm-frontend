import { type VariantProps } from 'class-variance-authority';
import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
  type SelectHTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import useOutsideClick from '@/shared/hooks/useOutsideClick';
import { cn } from '@/shared/lib/cn';

import { ArrowDown } from '../icons';

import { SelectContext } from './context/SelectContext';
import { selectButtonVaraint, selectListContainerVariant } from './variant/select';

export interface SelectProps
  extends Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      'size' | 'color' | 'onChange' | 'value' | 'defaultValue'
    >,
    VariantProps<typeof selectButtonVaraint> {
  children: ReactNode;
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

  const selectcontextValue = useMemo(
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
      Children.map(children, (child, index) => {
        if (!isValidElement(child)) return;

        if ((child.props as any).value === defaultValue) {
          setSelectedIndex(index + 1);
        }
        return cloneElement(child, {
          ...(child?.props as any),
          index: (child.props as any)?.index || index + 1,
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
          <ArrowDown
            className={cn('transition-transform', {
              'rotate-180': isExpanded,
            })}
          />
        </button>
        {isExpanded && (
          <ul
            ref={ulRef}
            role="listbox"
            id={selectId}
            className={selectListContainerVariant({
              size,
              expanded: isExpanded,
            })}
          >
            {SelectOptions}
          </ul>
        )}
      </div>
    </SelectContext.Provider>
  );
};
