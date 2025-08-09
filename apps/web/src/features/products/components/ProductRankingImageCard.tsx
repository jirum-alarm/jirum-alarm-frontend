'use client';

import { collectProductAction } from '@/app/actions/product';
import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';
import ProductImage from '@/features/products/components/image/ProductImage';
import { cn } from '@/lib/cn';
import { type QueryRankingProductsQuery } from '@/shared/api/gql/graphql';

export function ProductRankingImageCard({
  product,
  logging,
  activeIndex,
  index,
}: {
  product: QueryRankingProductsQuery['rankingProducts'][number];
  logging: { page: keyof typeof EVENT.PAGE };
  activeIndex: number;
  index: number;
  isMobile: boolean;
}) {
  const handleClick = () => {
    collectProductAction(+product.id);
  };

  return (
    <Link href={PAGE.DETAIL + '/' + product.id} onClick={handleClick} rel="preload">
      <div
        className={cn(
          'h-[340px] w-full origin-center scale-90 overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300 pc:h-auto pc:scale-100',
          activeIndex === index && 'scale-100',
        )}
      >
        <div className="relative h-[240px] w-full bg-gray-50 pc:aspect-square pc:h-auto">
          <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-900 text-sm font-medium text-primary-500">
            {index + 1}
          </div>
          <ProductImage
            src={product.thumbnail ?? ''}
            title={product.title}
            type="product"
            categoryId={product.categoryId}
            alt={product.title}
            width={252}
            height={252}
            sizes="252px"
            loading="eager"
          />
        </div>
        <div className="p-3 pb-0 pc:h-[110px]">
          <div className="line-clamp-2 text-sm text-gray-700 pc:xl:text-base">{product.title}</div>
          <div className="pt-2 text-lg font-bold text-gray-900 pc:h-[36px] pc:pt-0.5 pc:xl:text-[22px]">
            {product.price ?? ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
