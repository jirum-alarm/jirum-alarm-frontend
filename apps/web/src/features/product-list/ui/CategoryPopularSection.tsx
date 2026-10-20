'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { OrderOptionType, ProductOrderType, ThumbnailType } from '@/shared/api/gql/graphql';
import { categoryRankingPath } from '@/shared/config/category-ranking';
import { PAGE } from '@/shared/config/page';
import InteractiveMoreLink from '@/shared/ui/InteractiveMoreLink';

import { ProductQueries } from '@/entities/product';
import { CarouselProductsSection } from '@/entities/product-list/ui/carousel';

type Props = {
  categoryId: number | null;
  categoryName?: string | null;
  titlePrefix?: string; // e.g., ‘{카테고리}’에서 인기있는 상품
  limit?: number;
  logging?: { page: keyof typeof PAGE };
};

export default function CategoryPopularSection({
  categoryId,
  categoryName,
  titlePrefix = '‘{category}’에서 인기있는 상품',
  limit = 20,
}: Props) {
  const { data } = useSuspenseQuery(
    ProductQueries.products({
      limit,
      categoryId: categoryId ?? 0,
      thumbnailType: ThumbnailType.Mall,
      isEnd: false,
      orderBy: ProductOrderType.CommunityRanking,
      orderOption: OrderOptionType.Desc,
    }),
  );

  const products = data.products;

  const title = (titlePrefix || '').replace('{category}', categoryName || '기타');

  if (!products.length) return null;

  // 카테고리 허브(랭킹 탭)로 가는 크롤 가능한 링크. 상세 JSON-LD 빵부스러기의 가운데 단계와 같은 주소다 —
  // 구조화 데이터가 말하는 경로가 화면에도 있어야 한다.
  const rankingPath = categoryRankingPath(categoryId);

  return (
    <CarouselProductsSection
      title={title}
      products={products}
      source="category_popular"
      right={
        rankingPath ? (
          <InteractiveMoreLink
            href={rankingPath}
            aria-label={`${categoryName || '기타'} 핫딜 랭킹 더보기`}
          >
            더보기
          </InteractiveMoreLink>
        ) : undefined
      }
    />
  );
}
