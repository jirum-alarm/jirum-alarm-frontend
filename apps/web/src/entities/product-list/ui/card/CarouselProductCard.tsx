import { PAGE } from '@/shared/config/page';
import DisplayTime from '@/shared/ui/DisplayTime';
import HotdealBadge from '@/shared/ui/HotdealBadge';
import Link from '@/shared/ui/Link';

import { type ProductCardType } from '../../model/types';

import DisplayListPrice from './DisplayListPrice';
import ProductThumbnail from './ProductThumbnail';

export default function CarouselProductCard({ product }: { product: ProductCardType }) {
  return (
    <Link href={PAGE.DETAIL + '/' + product.id} className="pc:w-[192px] inline-block w-[120px]">
      <div className="pc:h-[192px] relative aspect-square h-[120px] overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        <ProductThumbnail
          src={product?.thumbnail ?? ''}
          title={product.title}
          categoryId={product.categoryId}
          type="hotDeal"
          alt={product.title}
          sizes="(max-width: 768px) 120px, 192px"
        />
        {product.isEnd ? (
          <div className="text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-tr-lg rounded-bl-lg bg-white px-2 text-xs text-gray-700">
            판매종료
          </div>
        ) : (
          product.hotDealType && (
            <div className="absolute bottom-0 left-0 z-10">
              <HotdealBadge badgeVariant="card" hotdealType={product.hotDealType} />
            </div>
          )
        )}
      </div>
      <div className="flex flex-col">
        <span className="line-clamp-2 h-12 w-full pt-2 text-sm wrap-break-word text-gray-700">
          {product.title}
        </span>
        <div className="flex items-center pt-1">
          <DisplayListPrice price={product.price} />
          <span className="w-2"></span>
          <span className="pc:inline hidden text-sm text-gray-600">
            <DisplayTime time={product.postedAt} />
          </span>
        </div>
      </div>
    </Link>
  );
}
