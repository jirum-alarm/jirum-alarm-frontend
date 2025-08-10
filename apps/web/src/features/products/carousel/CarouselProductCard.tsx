import { collectProductAction } from '@/app/actions/product';
import { PAGE } from '@/constants/page';

import HotdealBadge from '@shared/ui/HotdealBadge';
import Link from '@shared/ui/Link';

import ProductThumbnail from '../image/ProductThumbnail';
import { type ProductCardType } from '../type';

export default function CarouselProductCard({ product }: { product: ProductCardType }) {
  const handleClick = () => {
    collectProductAction(+product.id);
  };

  return (
    <Link
      href={PAGE.DETAIL + '/' + product.id}
      prefetch={false}
      className="inline-block w-[120px] pc:w-[192px]"
      onClick={handleClick}
    >
      <div className="relative aspect-square h-[120px] overflow-hidden rounded-lg border border-gray-200 bg-gray-50 pc:h-[192px]">
        <ProductThumbnail
          src={product?.thumbnail ?? ''}
          title={product.title}
          categoryId={product.categoryId}
          type="hotDeal"
          alt={product.title}
        />
        {product.isEnd ? (
          <div className="text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-bl-lg rounded-tr-lg bg-white px-2 text-xs text-gray-700">
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
        <span className="line-clamp-2 h-12 w-full break-words pt-2 text-sm text-gray-700">
          {product.title}
        </span>
        <div className="flex items-center pt-1">
          <span className="line-clamp-1 max-w-[98px] text-lg font-semibold text-gray-900">
            {product?.price ?? ''}
          </span>
        </div>
      </div>
    </Link>
  );
}
