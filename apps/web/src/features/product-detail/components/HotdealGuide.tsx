'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Fragment, useRef, useState } from 'react';

import Button from '@/components/common/Button';
import HotdealGuideItemCheckIcon from '@/components/common/icons/HotdealGuideItemCheckIcon';
import { cn } from '@/lib/cn';

import { ProductGuidesQuery } from '@shared/api/gql/graphql';

import { ProductQueries } from '@entities/product';

export default function HotdealGuide({
  productId,
  fixExpanded = false,
}: {
  productId: number;
  fixExpanded?: boolean;
}) {
  const {
    data: { productGuides },
  } = useSuspenseQuery(ProductQueries.productGuide({ productId }));

  const [isExpanded, setIsExpanded] = useState(fixExpanded);

  const guidesRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => {
    setIsExpanded(true);
  };

  const parsedGuides = productGuides?.filter((guide) => guide.title && guide.content);

  const isCollapsed = !fixExpanded && !isExpanded;

  if (!parsedGuides?.length) {
    return;
  }

  return (
    <section className="relative">
      <div className="flex h-14 items-center">
        <h2 className="text-lg font-bold text-gray-900">핫딜 제대로 알고 사자!</h2>
      </div>
      <div className={cn('border-secondary-300 overflow-hidden rounded-lg border pt-4')}>
        <div
          ref={guidesRef}
          className={cn('relative flex flex-col gap-y-4 px-3 break-all', {
            'max-h-64 overflow-y-hidden': isCollapsed,
          })}
        >
          {parsedGuides?.map((guide, i) => (
            <HotdealGuideItem key={`${guide.id}_${i}`} guide={guide} />
          ))}
          {isCollapsed && (
            <div className="absolute right-0 bottom-0 left-0 z-10 h-16 w-full bg-linear-to-t from-white via-white/80 to-transparent" />
          )}
          {!isCollapsed && (
            <div
              className={cn('bg-secondary-50 mt-4 rounded-lg p-3', {
                'mb-4': !isCollapsed,
              })}
            >
              <span className="text-[13px] leading-[16px] text-gray-600">
                * 요약은 실제와 다를 수 있어요. 상품 구매 시 정확한 행사 정보는 쇼핑몰 홈페이지에서
                확인해 주세요.
              </span>
            </div>
          )}
        </div>
        <div
          className={cn('relative flex h-16 items-center justify-center', {
            hidden: !isCollapsed,
          })}
        >
          <Button
            variant="filled"
            color="secondary"
            onClick={handleExpand}
            className={cn(
              'h-[32px] w-[104px] text-sm font-medium transition-opacity duration-300 ease-in-out',
              isCollapsed ? 'opacity-100' : 'pointer-events-none opacity-0',
            )}
            tabIndex={isCollapsed ? 0 : -1}
          >
            자세히 보기
          </Button>
        </div>
      </div>
    </section>
  );
}

function LinkText({ content }: { content: string }) {
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s]+)\))|(https?:\/\/[^\s]+)/g;
  const parts = [] as Array<{
    type: 'text' | 'markdown' | 'url';
    content?: string;
    text?: string;
    url?: string;
  }>;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index),
      });
    }

    if (match[1]) {
      const linkText = match[2];
      const url = match[3];
      parts.push({ type: 'markdown', text: linkText, url });
    } else {
      parts.push({ type: 'url', url: match[4] });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return (
    <div>
      {parts.map((part, index) => {
        switch (part.type) {
          case 'text':
            return part.content?.split('\n').map((text, i) => (
              <Fragment key={`${index}_text_${i}`}>
                {i > 0 && <br />}
                <span className="text-sm text-gray-600">{text}</span>
              </Fragment>
            ));
          case 'markdown':
            return (
              <a
                key={`${index}_markdown`}
                href={part.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 underline hover:text-blue-700 hover:no-underline"
              >
                {part.text}
              </a>
            );
          case 'url':
            return (
              <a
                key={`${index}_url`}
                href={part.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-500 underline hover:text-blue-700 hover:no-underline"
              >
                {part.url}
              </a>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function HotdealGuideItem({ guide }: { guide: ProductGuidesQuery['productGuides'][number] }) {
  return (
    <div className="flex gap-x-2">
      <div className="shrink-0">
        <HotdealGuideItemCheckIcon />
      </div>
      <div className="flex flex-col gap-y-1">
        <span className="text-base font-semibold text-gray-900">{guide.title}</span>
        <LinkText content={guide.content} />
      </div>
    </div>
  );
}
