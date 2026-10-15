'use client';

import { detailInfo } from '@jirum/design-system/recipes';
import { useSuspenseQuery } from '@tanstack/react-query';

import { cn } from '@/shared/lib/cn';

import { ProductQueries } from '@/entities/product';
import { isPriceGuideTitle } from '@/entities/product/lib/from-toss';

import type { ReactNode } from 'react';

export type GuideRow = { id: string; title?: string | null; content?: string | null };

type Props = {
  productId: number;
  /** desktop 은 라벨 칸이 넓다(110px). 모양은 둘 다 라벨 왼쪽·값 옆 줄바꿈(detailInfo). */
  variant: 'desktop' | 'mobile';
  /**
   * 서버(page.tsx)가 이미 받아둔 가이드. 넘어오면 쿼리를 타지 않아 Suspense 로 안 빠지고
   * 첫 HTML 에 행이 박힌다("없다가 생기는" 깜빡임·CLS 제거).
   */
  initialGuides?: GuideRow[] | null;
  /** 서버(dealEvidence)가 뺀 행 — 가격 조건 줄로 옮겼거나 제목·쇼핑몰·가격을 반복하는 행 */
  hiddenIds?: string[] | null;
  /** 토스 특가 코너 유입 — 가격·할인가 행을 숨긴다. */
  hidePrice?: boolean;
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
export default function ProductGuideMetaRows({
  productId,
  variant,
  initialGuides,
  hiddenIds,
  hidePrice,
}: Props) {
  // hooks 규칙상 조건부 useSuspenseQuery 가 불가해 경로를 컴포넌트로 갈랐다.
  if (initialGuides) {
    return (
      <GuideRows
        guides={initialGuides}
        variant={variant}
        hiddenIds={hiddenIds}
        hidePrice={hidePrice}
      />
    );
  }
  return (
    <GuideRowsFromQuery
      productId={productId}
      variant={variant}
      hiddenIds={hiddenIds}
      hidePrice={hidePrice}
    />
  );
}

function GuideRowsFromQuery({
  productId,
  variant,
  hiddenIds,
  hidePrice,
}: Pick<Props, 'productId' | 'variant' | 'hiddenIds' | 'hidePrice'>) {
  const {
    data: { productGuides },
  } = useSuspenseQuery(ProductQueries.productGuide({ productId }));

  return (
    <GuideRows
      guides={productGuides ?? []}
      variant={variant}
      hiddenIds={hiddenIds}
      hidePrice={hidePrice}
    />
  );
}

function GuideRows({
  guides,
  variant,
  hiddenIds,
  hidePrice,
}: {
  guides: GuideRow[];
  variant: Props['variant'];
  hiddenIds?: string[] | null;
  hidePrice?: boolean;
}) {
  const hidden = new Set(hiddenIds ?? []);
  const rows = guides
    .filter((g) => g.title && g.content && !hidden.has(String(g.id)))
    .filter((g) => !hidePrice || !isPriceGuideTitle(g.title!))
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
        <DetailInfoRow key={row.id} label={row.title} variant={variant}>
          {row.content}
        </DetailInfoRow>
      ))}
    </>
  );
}

/**
 * 상세 정보 표 한 줄 — 쇼핑몰·가이드·판매자·배송비가 모두 이 모양 하나를 쓴다.
 * 예전엔 짧은 값은 좌우 끝 정렬, 40자 넘는 값은 라벨 아래로 쌓아 한 표에 두 모양이 섞였다.
 */
export function DetailInfoRow({
  label,
  variant,
  children,
  valueClassName,
}: {
  label: string;
  variant: Props['variant'];
  children: ReactNode;
  valueClassName?: string;
}) {
  return (
    <div className={cn('flex', detailInfo.row)}>
      <dt className={cn(detailInfo.label, variant === 'desktop' && 'w-[110px]')}>{label}</dt>
      {/* break-keep — 한국어 낱말 중간에서 줄이 꺾이지 않게(「경/유」). */}
      <dd className={cn(detailInfo.value, 'break-keep', valueClassName)}>{children}</dd>
    </div>
  );
}
