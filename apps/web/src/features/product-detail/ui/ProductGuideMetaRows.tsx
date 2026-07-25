'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { cn } from '@/shared/lib/cn';

import { ProductQueries } from '@/entities/product';

type Props = {
  productId: number;
  /** desktop: 라벨 고정폭 / mobile: 좌우 정렬 */
  variant: 'desktop' | 'mobile';
};

function plainGuideContent(content: string): string {
  return content
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s]+)\)/g, '$1')
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * productGuides 를 쇼핑몰·추천수와 같은 메타 행으로 렌더.
 */
export default function ProductGuideMetaRows({ productId, variant }: Props) {
  const {
    data: { productGuides },
  } = useSuspenseQuery(ProductQueries.productGuide({ productId }));

  const rows =
    productGuides
      ?.filter((g) => g.title && g.content)
      .map((g) => ({
        id: g.id,
        title: g.title!,
        content: plainGuideContent(g.content!),
      })) ?? [];

  const visible = rows.filter((r) => r.content.length > 0);
  if (!visible.length) return null;

  return (
    <>
      {visible.map((row) => (
        <div
          key={row.id}
          className={cn(
            'text-sm font-medium',
            variant === 'desktop' ? 'flex' : 'flex justify-between gap-x-4',
          )}
        >
          <span
            className={cn(
              'shrink-0 text-gray-400',
              variant === 'desktop' && 'inline-block w-[110px]',
            )}
          >
            {row.title}
          </span>
          <span className={cn('text-gray-500', variant === 'mobile' && 'max-w-[70%] text-right')}>
            {row.content}
          </span>
        </div>
      ))}
    </>
  );
}
