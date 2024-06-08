'use client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { forwardRef, useEffect, useRef, useState } from 'react';

interface Props {
  comments?: string[];
  speed?: number;
}
const TypingEffectContainer = forwardRef<HTMLDivElement, Props>(({ comments, speed = 50 }, ref) => {
  // The scrollable element for your list
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count: comments?.length ?? 0,
    getScrollElement: () => commentsContainerRef.current ?? null,
    estimateSize: () => 35,
  });

  // const [displayedText, setDisplayedText] = useState('');
  // const [isFinished, setIsFinished] = useState(false);
  // const containerRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   if (!text) return;
  //   let index = 0;
  //   setDisplayedText('');
  //   setIsFinished(false);
  //   const intervalId = setInterval(() => {
  //     setDisplayedText((prev) => prev + text.charAt(index));
  //     index += 1;
  //     if (index >= text.length) {
  //       clearInterval(intervalId);
  //       setIsFinished(true);
  //     }
  //   }, speed);

  //   return () => clearInterval(intervalId);
  // }, [text, speed]);

  // useEffect(() => {
  //   if (containerRef.current) {
  //     containerRef.current.scrollTop = containerRef.current.scrollHeight;
  //   }
  // }, [displayedText]);

  // return (
  //   <div
  //     className="no-scrollbar h-96 w-full overflow-scroll rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input"
  //     ref={containerRef}
  //   >
  //     {!text ? (
  //       <Cursor />
  //     ) : (
  //       <div className=" whitespace-pre">
  //         {displayedText}
  //         {!isFinished && <Cursor />}
  //       </div>
  //     )}
  //   </div>
  // );
  return (
    <div
      ref={commentsContainerRef}
      className="h-96 w-full overflow-scroll rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input"
    >
      <div
        className="whitespace-pre leading-7"
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem, i) => (
          <p
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
            dangerouslySetInnerHTML={{ __html: comments?.[virtualItem.index] ?? '' }}
          />
        ))}
      </div>
    </div>
  );
});
TypingEffectContainer.displayName = 'TypingEffectContainer';
export default TypingEffectContainer;

const Cursor = () => {
  return (
    <div className=" ml-1 inline-block h-4 w-[2px] translate-y-[2px] animate-blink bg-black" />
  );
};
