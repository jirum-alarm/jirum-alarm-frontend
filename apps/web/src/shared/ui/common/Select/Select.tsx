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
import { selectButtonVariant, selectListContainerVariant } from './variant/select';

export interface SelectProps
  extends
    Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      'size' | 'color' | 'onChange' | 'value' | 'defaultValue'
    >,
    VariantProps<typeof selectButtonVariant> {
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
  const labelId = useId();
  const valueId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const ulRef = useRef<HTMLUListElement>(null);

  const onCloseOptionList = () => {
    setIsExpanded(false);
  };

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
          // combobox 는 안쪽 글자를 이름으로 쓰지 않는다 — 비우면 스크린리더가 「콤보 상자」만 읽는다(놀이터 axe 검사가 찾음).
          aria-labelledby={`${labelId} ${valueId}`}
          className={cn(selectButtonVariant({ size, color }), className)}
          onClick={toggleOptionList}
        >
          <span id={labelId} className="sr-only">
            {placeholder}
          </span>
          {/* 이름 = 「출생년도 1997」. 아직 안 골랐으면 보이는 안내 글자는 이름에서 빼 「출생년도」만 읽힌다. */}
          <span id={valueId}>
            {selectedIndex > 0 ? buttonTextRenderer() : <span aria-hidden>{placeholder}</span>}
          </span>
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
