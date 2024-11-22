import useOutsideClick from '@/hooks/useOutsideClick';
import { composeEventHandlers } from '@/util/event';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  content: React.ReactNode | string;
  children: React.ReactNode;
}

const Tooltip = ({ content, children }: Props) => {
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
    // const {
    //   top,
    //   left,
    //   width: triggerCompoWidth,
    //   height: triggerCompoHeight,
    // } = triggerRef.current.getBoundingClientRect();
    const polygonOffset = 28; // tooltip container기준 Polygon의 위치
    const polygonWidth = 10; // Polygon의 너비
    const offsetY = 14;
    const offsetX = polygonOffset - offsetWidth / 2 + polygonWidth / 2;
    setPos({ x: offsetLeft - offsetX, y: offsetTop + offsetHeight + offsetY });
  };

  const handleShowToolTipClick = () => {
    setIsShowToolTip((prev) => !prev);
    setTooltipPosition();
  };

  const triggerButton = React.isValidElement(children)
    ? React.cloneElement(children, {
        ...children.props,
        ref: triggerRef,
        onClick: composeEventHandlers(children?.props?.onClick, handleShowToolTipClick),
      })
    : null;

  return (
    <div className="relative flex" ref={toolTipContentRef}>
      {triggerButton}
      {isShowToolTip && (
        <div
          className="absolute z-50 whitespace-nowrap will-change-transform"
          // style={{ transform: `translate(${pos.x}px,${pos.y}px)` }}
          style={{
            top: pos.y, // 트리거 요소 기준 아래쪽
            left: pos.x, // 중앙 정렬
          }}
        >
          <div className="rounded-lg bg-gray-600 px-[16px] py-[10px]">{content}</div>
          <span className="absolute -top-[8px] left-[28px] text-gray-600">
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
