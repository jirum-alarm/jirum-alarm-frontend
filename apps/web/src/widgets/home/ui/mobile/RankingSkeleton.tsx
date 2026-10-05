import { type ProductCardType } from '@/entities/product-list/model/types';
import ProductRankingImageCard from '@/entities/product-list/ui/ranking/ProductRankingImageCard';

interface RankingPreviewProps {
  products: ProductCardType[];
}

/**
 * SSR 프리뷰 - loop 모드에서 [10위(좌측), 1위(가운데), 2위(우측)] 순서로 렌더링
 */
export const RankingPreview = ({ products }: RankingPreviewProps) => {
  if (products.length < 2) return null;

  // loop 모드: 좌측에 마지막 상품(10위), 가운데에 첫번째 상품(1위), 우측에 두번째 상품(2위)
  const lastProduct = products[products.length - 1];
  const firstProduct = products[0];
  const secondProduct = products[1];

  return (
    <div className="relative flex justify-center overflow-x-hidden">
      <div className="flex w-auto justify-center gap-x-1">
        <PreviewCard product={lastProduct} rank={products.length} isActive={false} />
        <PreviewCard product={firstProduct} rank={1} isActive={true} priority />
        <PreviewCard product={secondProduct} rank={2} isActive={false} />
      </div>
    </div>
  );
};

interface PreviewCardProps {
  product: ProductCardType;
  rank: number;
  isActive: boolean;
  priority?: boolean;
}

// 실제 슬라이드와 같은 카드를 그린다. 따로 그리면 스와이퍼가 뜨며 갈아끼울 때
// 빠진 줄(판매처·커뮤니티·시간)이 생기며 내용이 바뀌는 게 보인다.
const PreviewCard = ({ product, rank, isActive, priority }: PreviewCardProps) => (
  <div className="w-[240px] shrink-0 pb-5">
    <ProductRankingImageCard
      product={product}
      rank={rank}
      activeIndex={0}
      index={isActive ? 0 : 1}
      priority={priority}
      source="home_ranking"
    />
  </div>
);

/** 로딩 스켈레톤 (fallback용) */
export const RankingSkeleton = () => {
  return (
    <div className="relative flex justify-center overflow-x-hidden">
      <div className="flex w-auto justify-center gap-x-1">
        <SkeletonCard isActive={false} />
        <SkeletonCard isActive={true} />
        <SkeletonCard isActive={false} />
      </div>
    </div>
  );
};

const SkeletonCard = ({ isActive }: { isActive: boolean }) => (
  <div className="w-[240px] shrink-0 pb-5">
    <div
      className={`h-[352px] w-full origin-center overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        isActive ? 'scale-100' : 'scale-90'
      }`}
    >
      <div className="relative h-[240px] w-full bg-gray-50">
        <div className="bg-fixed-900 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg">
          <div className="h-3 w-2 animate-pulse rounded-sm bg-gray-600" />
        </div>
        <div className="h-full w-full animate-pulse bg-gray-100" />
      </div>
      <div className="p-3 pb-0">
        <div className="mb-2 h-10 w-full animate-pulse rounded-sm bg-gray-100" />
        <div className="pt-2">
          <div className="h-6 w-1/2 animate-pulse rounded-sm bg-gray-100" />
        </div>
      </div>
    </div>
  </div>
);
