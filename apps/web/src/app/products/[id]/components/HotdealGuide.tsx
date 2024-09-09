'use client';

import { useEffect, useRef, useState } from 'react';

import Button from '@/components/common/Button';
import { ArrowDown } from '@/components/common/icons';
import { cn } from '@/lib/cn';
import { ProductGuidesQuery } from '@/shared/api/gql/graphql';

export default function HotdealGuide({
  productGuides,
}: {
  productGuides: ProductGuidesQuery['productGuides'];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);

  const guidesRef = useRef<HTMLDivElement>(null);

  const handleExpand = () => {
    setIsExpanded(true);

    if (!guidesRef.current) {
      return;
    }

    if (needsExpansion) {
      setNeedsExpansion(false);
    }
  };

  useEffect(() => {
    if (!guidesRef.current) {
      return;
    }

    const height = guidesRef.current.clientHeight;

    if (height > 310) {
      setNeedsExpansion(true);
    }
  }, []);

  const parsedGuides = productGuides?.filter((guide) => guide.title && guide.content);

  if (!parsedGuides?.length) {
    return;
  }

  return (
    <section ref={guidesRef} className="relative">
      <div className="rounded-t bg-primary-100 px-4 py-3">
        <h2 className="text-primary-800">핫딜 정보 요약</h2>
      </div>

      <div
        className={cn('flex flex-col gap-y-4 break-all py-4', {
          'h-64 overflow-hidden': needsExpansion,
        })}
      >
        {parsedGuides?.map((guide) => <HotdealGuideItem key={guide.id} guide={guide} />)}
      </div>

      {needsExpansion && (
        <div className="relative">
          <div className="absolute -top-16 h-16 w-full bg-gradient-to-t from-white"></div>
          <Button
            variant="outlined"
            onClick={handleExpand}
            className="flex items-center justify-center gap-x-2 border-gray-300 from-white"
          >
            자세히 보기
            <ArrowDown />
          </Button>
        </div>
      )}

      {isExpanded && (
        <div className="rounded-b bg-gray-50 px-3 py-2">
          <span className="text-sm text-gray-500">
            *요약은 실제와 다를 수 있습니다.
            <br />
            상품 구매시 행사 정보는 쇼핑몰 홈페이지에서 확인해 주세요.
          </span>
        </div>
      )}
    </section>
  );
}

function LinkText({ content }: { content: string }) {
  // 마크다운 링크와 일반 URL을 구분하는 정규표현식
  const regex = /(\[([^\]]+)\]\((https?:\/\/[^\s]+)\))|(https?:\/\/[^\s]+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(content)) !== null) {
    // 일반 텍스트 추가
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: content.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      // [링크](url) 형식
      const linkText = match[2];
      const url = match[3];
      parts.push({ type: 'markdown', text: linkText, url });
    } else {
      // 단순 URL
      parts.push({ type: 'url', url: match[4] });
    }

    lastIndex = regex.lastIndex;
  }

  // 마지막 일반 텍스트 추가
  if (lastIndex < content.length) {
    parts.push({ type: 'text', content: content.slice(lastIndex) });
  }

  return (
    <div>
      {parts.map((part, index) => {
        switch (part.type) {
          case 'text':
            return part.content?.split('\n').map((text, index) => (
              <>
                {index > 0 && <br />}
                <span key={index} className="text-gray-600">
                  {text}
                </span>
              </>
            ));
          case 'markdown':
            return (
              <a
                key={index}
                href={part.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline hover:text-blue-700 hover:no-underline"
              >
                {part.text}
              </a>
            );
          case 'url':
            return (
              <a
                key={index}
                href={part.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline hover:text-blue-700 hover:no-underline"
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
    <div className="flex gap-x-2 px-3">
      <div className="h-5 w-5 rounded-full bg-primary-100 p-[3px]">
        <HotdealGuideItemCheckIcon />
      </div>
      <div className="flex flex-col">
        <span className="leading-5 text-gray-900">{guide.title}</span>
        <LinkText content={guide.content} />
      </div>
    </div>
  );
}

function HotdealGuideItemCheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path
        d="M11 4.5L5.5 10L3 7.5"
        stroke="#7FC125"
        strokeLinecap="square"
        strokeLinejoin="round"
      />
    </svg>
  );
}
