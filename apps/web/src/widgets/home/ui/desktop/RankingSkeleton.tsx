import { type ProductCardType } from '@/entities/product-list/model/types';
import ProductRankingImageCard from '@/entities/product-list/ui/ranking/ProductRankingImageCard';

interface RankingPreviewProps {
  products: ProductCardType[];
}

/**
 * SSR 프리뷰 - 데스크톱에서 1, 2, 3, 4위 상품 렌더링
 */
export const RankingPreview = ({ products }: RankingPreviewProps) => {
  if (products.length < 4) return null;

  return (
    <div className="relative grid w-full grid-cols-4 justify-center gap-x-6 overflow-x-hidden pb-5">
      {products.slice(0, 4).map((product, i) => (
        // 실제 슬라이드와 같은 카드 — 따로 그리면 갈아끼울 때 판매처·커뮤니티 줄이 생기는 게 보인다.
        <ProductRankingImageCard
          key={product.id}
          product={product}
          rank={i + 1}
          activeIndex={0}
          index={i}
          priority={i === 0}
          source="home_ranking"
        />
      ))}
    </div>
  );
};

/** 로딩 스켈레톤 (fallback용) */
export const RankingSkeleton = () => {
  return (
    <div className="relative grid w-full grid-cols-4 justify-center gap-x-6 overflow-x-hidden pb-5">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

const SkeletonCard = () => {
  return (
    <div className="shadow-card col-span-1 overflow-hidden rounded-lg border bg-white">
      <div className="relative aspect-square w-full bg-gray-50">
        <div className="absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-600/80">
          <div className="h-3 w-2 animate-pulse rounded-sm bg-gray-400" />
        </div>
        <div className="h-full w-full animate-pulse bg-gray-100" />
      </div>
      <div className="h-[132px] p-3 pb-0">
        <div className="mb-2 h-10 w-full animate-pulse rounded-sm bg-gray-100" />
        <div className="pt-0.5">
          <div className="h-6 w-1/2 animate-pulse rounded-sm bg-gray-100" />
        </div>
      </div>
    </div>
  );
};
