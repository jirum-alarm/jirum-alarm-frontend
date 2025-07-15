'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { AIIcon, ArrowRight } from '@/components/common/icons';
import { ProductQueries } from '@/entities/product';
import { cn } from '@/lib/cn';
import { getFromNow } from '@/util/date';

function ReactionKeywords({
  productId,
  provider,
  url,
}: {
  productId: number;
  provider: string;
  url: string;
}) {
  const {
    data: { categorizedReactionKeywords },
  } = useSuspenseQuery(ProductQueries.reactionKeywords({ id: productId }));

  const { items, lastUpdatedAt: lastUpdatedAtString } = categorizedReactionKeywords;

  const lastUpdatedAt = lastUpdatedAtString ? getFromNow(lastUpdatedAtString) + ' 업데이트' : null;

  if (!lastUpdatedAt || !items.length) {
    return (
      <section className="rounded-lg bg-secondary-50">
        <header className="flex h-[56px] items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center">
              <AIIcon className="size-5" />
            </span>
            <span className="font-semibold text-gray-900">요약 준비중</span>
          </div>
          <a
            className="flex h-full items-center gap-x-1 text-sm font-semibold text-secondary-700"
            href={url}
            aria-label={`‘${provider ?? '커뮤니티'}’ 반응 보러가기`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>‘{provider ?? '커뮤니티'}’ 반응 보러가기</span>
            <span className="flex size-5 items-center justify-center rounded-3xl bg-secondary-100">
              <ArrowRight color="#2B4B95" width={16} height={16} strokeWidth={1.5} />
            </span>
          </a>
        </header>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-secondary-50">
      <header className="flex items-center justify-between py-4 pl-3 pr-4">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center">
            <AIIcon className="size-5" />
          </span>
          <span className="font-semibold text-gray-900">AI가 요약했어요</span>
        </div>
        <time className="text-sm font-medium text-gray-400">{lastUpdatedAt}</time>
      </header>
      <ul className="flex flex-wrap gap-x-2 gap-y-1.5 px-4">
        {items.map((item) => (
          <li
            key={item.name}
            className={cn([
              'flex gap-x-1 rounded-[40px] border bg-white px-3.5 py-2',
              {
                'border-secondary-300': item.type === 'POSITIVE',
                'border-error-200': item.type === 'NEGATIVE',
                'border-gray-300': item.type === 'SYNONYM',
              },
            ])}
          >
            <span className="text-sm font-medium text-gray-500">{item.tag}</span>
            <span className="text-sm font-medium text-gray-900">{item.name}</span>
            <span
              className={cn([
                'text-sm font-semibold',
                {
                  'text-secondary-700': item.type === 'POSITIVE',
                  'text-error-400': item.type === 'NEGATIVE',
                  'text-gray-500': item.type === 'SYNONYM',
                },
              ])}
            >
              {item.count}
            </span>
          </li>
        ))}
      </ul>
      <footer className="flex w-full justify-end">
        <a
          className="flex items-center gap-x-1 px-4 py-4 text-sm font-semibold text-secondary-700"
          href={url}
          aria-label={`‘${provider ?? '커뮤니티'}’ 반응 보러가기`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>‘{provider ?? '커뮤니티'}’ 반응 보러가기</span>
          <span className="flex size-5 items-center justify-center rounded-3xl bg-secondary-100">
            <ArrowRight color="#2B4B95" width={16} height={16} strokeWidth={1.5} />
          </span>
        </a>
      </footer>
    </section>
  );
}

export default ReactionKeywords;
