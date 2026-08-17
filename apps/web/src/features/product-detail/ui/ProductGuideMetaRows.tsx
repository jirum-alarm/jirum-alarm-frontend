'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { cn } from '@/shared/lib/cn';

import { ProductQueries } from '@/entities/product';

export type GuideRow = { id: string; title?: string | null; content?: string | null };

type Props = {
  productId: number;
  /** desktop: 라벨 고정폭 / mobile: 좌우 정렬 */
  variant: 'desktop' | 'mobile';
  /**
   * 서버(page.tsx)가 이미 받아둔 가이드. 넘어오면 쿼리를 타지 않아 Suspense 로 안 빠지고
   * 첫 HTML 에 행이 박힌다("없다가 생기는" 깜빡임·CLS 제거).
   */
  initialGuides?: GuideRow[] | null;
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
 * initialGuides 가 있으면 그걸로 즉시 렌더, 없으면 쿼리로 받아온다.
 */
export default function ProductGuideMetaRows({ productId, variant, initialGuides }: Props) {
  // hooks 규칙상 조건부 useSuspenseQuery 가 불가해 경로를 컴포넌트로 갈랐다.
  if (initialGuides) {
    return <GuideRows guides={initialGuides} variant={variant} />;
  }
  return <GuideRowsFromQuery productId={productId} variant={variant} />;
}

function GuideRowsFromQuery({ productId, variant }: Pick<Props, 'productId' | 'variant'>) {
  const {
    data: { productGuides },
  } = useSuspenseQuery(ProductQueries.productGuide({ productId }));

  return <GuideRows guides={productGuides ?? []} variant={variant} />;
}

function GuideRows({ guides, variant }: { guides: GuideRow[]; variant: Props['variant'] }) {
  const rows = guides
    .filter((g) => g.title && g.content)
    .map((g) => ({
      id: g.id,
      title: g.title!,
      content: plainGuideContent(g.content!),
    }));

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
