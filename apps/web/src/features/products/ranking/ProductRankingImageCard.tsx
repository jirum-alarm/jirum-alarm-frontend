'use client';

import { PAGE } from '@/constants/page';
import { cn } from '@/lib/cn';

import Link from '@shared/ui/Link';

import ProductThumbnail from '../image/ProductThumbnail';
import { type ProductCardType } from '../type';

export default function ProductRankingImageCard({
  product,
  activeIndex,
  index,
}: {
  product: Omit<ProductCardType, 'postedAt'>;
  activeIndex: number;
  index: number;
}) {
  return (
    <Link href={PAGE.DETAIL + '/' + product.id} rel="preload">
      <div
        className={cn(
          'pc:h-auto pc:scale-100 h-[340px] w-full origin-center scale-90 overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all duration-300',
          activeIndex === index && 'scale-100',
        )}
      >
        <div className="pc:aspect-square pc:h-auto relative h-[240px] w-full bg-gray-50">
          <div className="text-primary-500 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-900 text-sm font-medium">
            {index + 1}
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
          />
        </div>
        <div className="pc:h-[110px] p-3 pb-0">
          <div className="xl:pc:text-base line-clamp-2 text-sm text-gray-700">{product.title}</div>
          <div className="pc:h-[36px] pc:pt-0.5 xl:pc:text-[22px] pt-2 text-lg font-bold text-gray-900">
            {product.price ?? ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
