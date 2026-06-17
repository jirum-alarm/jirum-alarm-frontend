import { PAGE } from '@/shared/config/page';
import Link from '@/shared/ui/Link';

import { type ProductCardType } from '@/entities/product-list/model/types';
import DisplayListPrice from '@/entities/product-list/ui/card/DisplayListPrice';
import ProductThumbnail from '@/entities/product-list/ui/card/ProductThumbnail';

type RankingProduct = Omit<ProductCardType, 'postedAt'>;

interface RankingPreviewProps {
  products: RankingProduct[];
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
  product: RankingProduct;
  rank: number;
  isActive: boolean;
  priority?: boolean;
}

const PreviewCard = ({ product, rank, isActive, priority }: PreviewCardProps) => (
  <div className="w-[240px] shrink-0 pb-5">
    <Link href={PAGE.DETAIL + '/' + product.id} rel="preload">
      <div
        className={`bg-surface-default h-[340px] w-full origin-center overflow-hidden rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 ${
          isActive ? 'scale-100' : 'scale-90'
        }`}
      >
        <div className="bg-surface-subtle relative h-[240px] w-full">
          <div className="text-primary-500 typography-body-14m bg-surface-inverse absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg">
            {rank}
          </div>
          <ProductThumbnail
            src={product.thumbnail ?? ''}
            title={product.title}
            type="product"
            categoryId={product.categoryId}
            alt={product.title}
            sizes="252px"
            priority={priority}
            quality={priority ? 85 : 75}
          />
        </div>
        <div className="p-3 pb-0">
          <div className="line-clamp-2 text-sm text-gray-700">{product.title}</div>
          <div className="typography-title-18b text-fg-primary pt-2">
            <DisplayListPrice price={product.price} />
          </div>
        </div>
      </div>
    </Link>
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
      className={`bg-surface-default h-[340px] w-full origin-center overflow-hidden rounded-lg shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 ${
        isActive ? 'scale-100' : 'scale-90'
      }`}
    >
      <div className="bg-surface-subtle relative h-[240px] w-full">
        <div className="bg-surface-inverse absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg">
          <div className="h-3 w-2 animate-pulse rounded-sm bg-gray-600" />
        </div>
        <div className="bg-surface-muted h-full w-full animate-pulse" />
      </div>
      <div className="p-3 pb-0">
        <div className="bg-surface-muted mb-2 h-10 w-full animate-pulse rounded-sm" />
        <div className="pt-2">
          <div className="bg-surface-muted h-6 w-1/2 animate-pulse rounded-sm" />
        </div>
      </div>
    </div>
  </div>
);
