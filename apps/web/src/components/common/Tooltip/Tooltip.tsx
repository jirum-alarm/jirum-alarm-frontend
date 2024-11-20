import useOutsideClick from '@/hooks/useOutsideClick';
import { composeEventHandlers } from '@/util/event';
import React, { useEffect, useRef, useState } from 'react';

interface Props {
  content: React.ReactNode | string;
  children: React.ReactNode;
}

const Tooltip = ({ content, children }: Props) => {
  const [isShow, setShow] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const toolTipContentRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);

  useOutsideClick(toolTipContentRef, () => {
    setShow(false);
  });

  const updateTooltipPosition = () => {
    if (!triggerRef.current) return;
    const {
      top,
      left,
      width: triggerCompoWidth,
      height: triggerCompoHeight,
    } = triggerRef.current.getBoundingClientRect();
    const polygonOffset = 28; // tooltip container기준 Polygon의 위치
    const polygonWidth = 10; // Polygon의 너비
    const offsetY = 14;
    const offsetX = polygonOffset - triggerCompoWidth / 2 + polygonWidth / 2;
    setPos({ x: left - offsetX, y: top + triggerCompoHeight + offsetY });
  };

  useEffect(() => {
    const handleResize = () => {
      if (isShow) {
        updateTooltipPosition(); // 화면 크기 변경 시 위치 업데이트
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isShow]);

  const handleTrigger = () => {
    setShow((prev) => !prev);
    updateTooltipPosition();
  };

  const triggerButton = React.isValidElement(children)
    ? React.cloneElement(children, {
        ...children.props,
        ref: triggerRef,
        onClick: composeEventHandlers(children?.props?.onClick, handleTrigger),
      })
    : null;

  return (
    <>
      {triggerButton}
      {isShow && (
        <div
          ref={toolTipContentRef}
          className="fixed left-0 top-0 z-50 will-change-transform"
          style={{ transform: `translate(${pos.x}px,${pos.y}px)` }}
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
    </>
  );
};

export default Tooltip;
