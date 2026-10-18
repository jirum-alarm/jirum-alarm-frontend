'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { OrderOptionType, ProductOrderType, ThumbnailType } from '@/shared/api/gql/graphql';
import { PAGE } from '@/shared/config/page';
import DetailSectionHeader from '@/shared/ui/DetailSectionHeader';
import Link from '@/shared/ui/Link';

import { ProductQueries } from '@/entities/product';

const LIMIT = 10;

/**
 * 「방금 올라온 ‘카테고리’ 핫딜」 — 같은 카테고리 최신 딜 글자 링크.
 * 구글은 10/9 이후 딜을 거의 색인하지 않는다(GSC URL 검사: 사이트맵으로 「발견됨」인데 크롤 안 함).
 * Googlebot 은 하루 3천 번 넘게 상세를 긁지만 92% 가 옛 딜이고, 상세가 거는 딜 링크는 카테고리 인기 20개뿐이라
 * 새 딜로 가는 내부 링크가 거의 없었다(2026-10-18 Loki·GSC 실측). 옛 상세가 긁힐 때마다 그 순간의 새 딜을 가리키게 한다.
 * 그래서 캐러셀(클라 스크롤)이 아니라 첫 HTML 에 박히는 평범한 링크 목록이다. 실험 등록부 obs_seo_google_new_deal_discovery.
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
      <ul className="flex flex-col">
        {products.map((p) => (
          <li key={p.id}>
            <Link
              href={PAGE.DETAIL + '/' + p.id}
              className="line-clamp-1 py-2 text-sm text-gray-700 hover:text-gray-900"
            >
              {p.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
