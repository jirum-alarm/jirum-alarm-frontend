'use client';
import { useVirtualizer } from '@tanstack/react-virtual';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  comments?: string[];
  highlightedSynonym: string[];
  highlightedExcludeSynonym: string[];
}
const CommentsContainer = forwardRef<HTMLDivElement, Props>(
  ({ comments, highlightedSynonym, highlightedExcludeSynonym }, ref) => {
    // The scrollable element for your list
    const commentsContainerRef = useRef<HTMLDivElement>(null);

    // The virtualizer
    const rowVirtualizer = useVirtualizer({
      count: comments?.length ?? 0,
      getScrollElement: () => commentsContainerRef.current ?? null,
      estimateSize: () => 35,
    });

    const highlightTextRenderer = useCallback(
      (text: string) => {
        let highlightText = text;
        highlightedExcludeSynonym.forEach((synonym) => {
          const regex = new RegExp(`(${synonym})`, 'g');
          highlightText = highlightText.replace(
            regex,
            `<span class="bg-rose-300">${synonym}</span>`,
          );
        });
        highlightedSynonym.forEach((synonym) => {
          const regex = new RegExp(`(?<!<[^>]*?>)(${synonym})(?![^<]*?>)`, 'g');
          highlightText = highlightText.replace(
            regex,
            `<span class="bg-green-300">${synonym}</span>`,
          );
        });
        return highlightText;
      },
      [highlightedExcludeSynonym, highlightedSynonym],
    );

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
              dangerouslySetInnerHTML={{
                __html: highlightTextRenderer(comments?.[virtualItem.index] ?? ''),
              }}
            />
          ))}
        </div>
      </div>
    );
  },
);
CommentsContainer.displayName = 'CommentsContainer';
export default CommentsContainer;

const Cursor = () => {
  return (
    <div className=" ml-1 inline-block h-4 w-[2px] translate-y-[2px] animate-blink bg-black" />
  );
};
