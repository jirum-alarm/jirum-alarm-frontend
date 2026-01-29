'use client';

import { PAGE } from '@/shared/config/page';
import HotdealBadge from '@/shared/ui/HotdealBadge';
import Link from '@/shared/ui/Link';

import { type ProductCardType } from '../../model/types';

import DisplayListPrice from './DisplayListPrice';
import ProductThumbnail from './ProductThumbnail';

export default function DoubleRowProductCard({ product }: { product: ProductCardType }) {
  return (
    <Link href={PAGE.DETAIL + '/' + product.id}>
      <div className="flex w-full flex-row items-start gap-2">
        <div className="relative h-[120px] w-[120px] shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <ProductThumbnail
            src={product?.thumbnail ?? ''}
            title={product.title}
            categoryId={product.categoryId}
            type="product"
            alt={product.title}
            sizes="120px"
          />
          {product.isEnd && (
            <div className="text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-tr-lg rounded-bl-lg bg-white px-2 text-xs text-gray-700">
              판매종료
            </div>
          )}
        </div>
        <div className="flex h-[120px] flex-col gap-1 py-2">
          {product.hotDealType && !product.isEnd && (
            <div className="mb-0">
              <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
            </div>
          )}
          <span className="line-clamp-2 text-sm font-normal break-all text-gray-800">
            {product.title}
          </span>
          <div className="mt-auto">
            <DisplayListPrice widthType="wide" price={product.price} />
          </div>
        </div>
      </div>
    </Link>
  );
}
