import {
  cloneElement,
  HTMLAttributes,
  isValidElement,
  ReactElement,
  RefAttributes,
  useRef,
  useState,
} from 'react';

import useOutsideClick from '@shared/hooks/useOutsideClick';
import { cn } from '@shared/lib/cn';
import { composeEventHandlers } from '@shared/lib/utils/event';

interface Props {
  content: React.ReactNode | string;
  children: ReactElement<HTMLAttributes<HTMLElement> & RefAttributes<HTMLElement>>;
  align?: 'left' | 'right';
  polygonOffset?: number;
}

const Tooltip = ({ content, children, align = 'left', polygonOffset = 28 }: Props) => {
  const [isShowToolTip, setIsShowToolTip] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const toolTipContentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  useOutsideClick(toolTipContentRef, () => {
    setIsShowToolTip(false);
  });

  const setTooltipPosition = () => {
    if (!triggerRef.current) return;
    const { offsetTop, offsetLeft, offsetHeight, offsetWidth } = triggerRef.current;
    const polygonWidth = 10;
    const offsetY = 14;

    let x = 0;
    if (align === 'left') {
      const offsetX = polygonOffset - offsetWidth / 2 + polygonWidth / 2;
      x = offsetLeft - offsetX;
    } else if (align === 'right') {
      const offsetX = -polygonOffset + offsetWidth / 2 - polygonWidth / 2;
      x = offsetLeft + offsetX;
    }
    setPos({ x, y: offsetTop + offsetHeight + offsetY });
  };

  const handleShowToolTipClick = () => {
    setIsShowToolTip((prev) => !prev);
    setTooltipPosition();
  };

  const triggerButton = isValidElement(children)
    ? cloneElement(children, {
        ...children.props,
        ref: triggerRef,
        onClick: composeEventHandlers(children.props.onClick, handleShowToolTipClick),
      })
    : null;

  return (
    <div className="relative flex" ref={toolTipContentRef}>
      {triggerButton}
      {isShowToolTip && (
        <div
          className="absolute z-50 whitespace-nowrap will-change-transform"
          style={{
            top: pos.y - 12,
            [align]: pos.x,
          }}
        >
          <div className="rounded-lg bg-gray-600 px-[16px] py-[10px]">{content}</div>
          <span
            className={cn('absolute -top-[8px] text-gray-600')}
            style={{
              [align]: polygonOffset,
            }}
          >
            <svg
              width="10"
              height="8"
              viewBox="0 0 10 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M5 0L10 8H0L5 0Z" fill="currentColor" />
            </svg>
          </span>
        </div>
      )}
    </div>
  );
};

export default Tooltip;
