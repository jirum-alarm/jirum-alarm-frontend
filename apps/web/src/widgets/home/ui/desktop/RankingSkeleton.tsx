import Link from '@shared/ui/Link';

import { PAGE } from '@/shared/config/page';

import { ProductCardType } from '@/entities/product-list';
import { DisplayListPrice, ProductThumbnail } from '@/entities/product-list';

type RankingProduct = Omit<ProductCardType, 'postedAt'>;

interface RankingPreviewProps {
  products: RankingProduct[];
}

export const RankingPreview = ({ products }: RankingPreviewProps) => {
  if (products.length < 4) return null;

  return (
    <div className="relative grid w-full grid-cols-4 justify-center gap-x-6 overflow-x-hidden pb-5">
      {products.slice(0, 4).map((product, i) => (
        <PreviewCard key={product.id} product={product} rank={i + 1} priority={i < 4} />
      ))}
    </div>
  );
};

interface PreviewCardProps {
  product: RankingProduct;
  rank: number;
  priority?: boolean;
}

const PreviewCard = ({ product, rank, priority }: PreviewCardProps) => (
  <Link href={PAGE.DETAIL + '/' + product.id} rel="preload">
    <div className="col-span-1 overflow-hidden rounded-lg border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-square w-full bg-gray-50">
        <div className="absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-600/80 text-sm font-medium text-white">
          {rank}
        </div>
        <ProductThumbnail
          src={product.thumbnail ?? ''}
          title={product.title}
          type="product"
          categoryId={product.categoryId}
          alt={product.title}
          width={252}
          height={252}
          sizes="252px"
          loading="eager"
          priority={priority}
        />
      </div>
      <div className="h-[110px] p-3 pb-0">
        <div className="line-clamp-2 text-sm text-gray-700 xl:text-base">{product.title}</div>
        <div className="h-[36px] pt-0.5 text-lg font-bold text-gray-900 xl:text-[22px]">
          <DisplayListPrice price={product.price} />
        </div>
      </div>
    </div>
  </Link>
);

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
    <div className="col-span-1 overflow-hidden rounded-lg border bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
      <div className="relative aspect-square w-full bg-gray-50">
        <div className="absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-600/80">
          <div className="h-3 w-2 animate-pulse rounded-sm bg-gray-400" />
        </div>
        <div className="h-full w-full animate-pulse bg-gray-100" />
      </div>
      <div className="h-[110px] p-3 pb-0">
        <div className="mb-2 h-10 w-full animate-pulse rounded-sm bg-gray-100" />
        <div className="pt-0.5">
          <div className="h-6 w-1/2 animate-pulse rounded-sm bg-gray-100" />
        </div>
      </div>
    </div>
  );
};
