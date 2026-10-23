'use client';

import { text } from '@jirum/design-system/recipes';
import { useSuspenseQuery } from '@tanstack/react-query';

import { OrderOptionType, ProductOrderType, ThumbnailType } from '@/shared/api/gql/graphql';
import type { ProductListResult } from '@/shared/api/product/product-list.service';
import { PAGE } from '@/shared/config/page';
import { cn } from '@/shared/lib/cn';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';
import DisplayTime from '@/shared/ui/DisplayTime';
import Link from '@/shared/ui/Link';

import { ProductQueries } from '@/entities/product';

const LIMIT = 10;
/** 펼쳐 둘 줄 — 나머지는 <details> 안(닫혀 있어도 HTML 링크라 크롤러는 따라간다). */
const VISIBLE = 5;

/**
 * 「방금 올라온 ‘카테고리’ 핫딜」 — 같은 카테고리 최신 딜 글자 링크.
 * 구글은 10/9 이후 딜을 거의 색인하지 않는다(GSC URL 검사: 사이트맵으로 「발견됨」인데 크롤 안 함).
 * Googlebot 은 하루 3천 번 넘게 상세를 긁지만 92% 가 옛 딜이고, 상세가 거는 딜 링크는 카테고리 인기 20개뿐이라
 * 새 딜로 가는 내부 링크가 거의 없었다(2026-10-18 Loki·GSC 실측). 옛 상세가 긁힐 때마다 그 순간의 새 딜을 가리키게 한다.
 * 그래서 캐러셀(클라 스크롤)이 아니라 첫 HTML 에 박히는 평범한 링크 목록이다. 실험 등록부 obs_seo_google_new_deal_discovery.
 * 2026-10-23: 본문 크기 제목 10줄이 상세 아래를 다 덮어 시끄러웠다 — 링크 10개(실험이 보는 것)는 그대로 HTML 에 두고,
 * 작은 글자 한 줄 + 올라온 시각, 5줄만 펼치고 나머지는 접는다.
 */
export default function CategoryLatestLinksSection({
  productId,
  categoryId,
  categoryName,
}: {
  productId: number;
  categoryId: number | null;
  categoryName?: string | null;
}) {
  const { data } = useSuspenseQuery(
    ProductQueries.products({
      // 지금 보는 딜이 끼면 한 칸 빠지니 하나 더 받는다.
      limit: LIMIT + 1,
      categoryId: categoryId ?? 0,
      thumbnailType: ThumbnailType.Mall,
      isEnd: false,
      orderBy: ProductOrderType.Id,
      orderOption: OrderOptionType.Desc,
    }),
  );
  const products = data.products.filter((p) => Number(p.id) !== productId).slice(0, LIMIT);
  if (!products.length) return null;

  return (
    <section className="px-5" aria-label="방금 올라온 핫딜">
      <DetailSectionHeader
        title={`방금 올라온 ‘${categoryName || '기타'}’ 핫딜`}
        className="mb-3"
      />
      <LinkRows products={products.slice(0, VISIBLE)} />
      {products.length > VISIBLE && (
        <details className="group">
          <summary
            className={cn(
              text.muted,
              'cursor-pointer list-none py-2 group-open:hidden hover:text-gray-900',
            )}
          >
            {products.length - VISIBLE}개 더 보기 ›
          </summary>
          <LinkRows products={products.slice(VISIBLE)} />
        </details>
      )}
    </section>
  );
}

function LinkRows({ products }: { products: ProductListResult['products'] }) {
  return (
    <ul className="flex flex-col divide-y divide-gray-100">
      {products.map((p) => (
        <li key={p.id}>
          <Link
            href={PAGE.DETAIL + '/' + p.id}
            className="flex items-baseline justify-between gap-3 py-2 text-sm text-gray-700 hover:text-gray-900"
          >
            <span className="line-clamp-1 min-w-0">{p.title}</span>
            <span className={cn(text.caption, 'shrink-0')}>
              <DisplayTime time={p.postedAt} />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
