'use client';

import { collectProductAction } from '@/app/actions/product';
import { PAGE } from '@/constants/page';

import DisplayTime from '@shared/ui/DisplayTime';
import HotdealBadge from '@shared/ui/HotdealBadge';
import Link from '@shared/ui/Link';

import ProductThumbnail from '../image/ProductThumbnail';
import { type ProductCardType } from '../type';

export default function ProductGridCard({
  product,
  rank,
  actionIcon,
}: {
  product: ProductCardType;
  rank?: number;
  actionIcon?: React.ReactNode;
}) {
  const handleClick = () => {
    collectProductAction(+product.id!);
  };

  return (
    <Link
      href={PAGE.DETAIL + '/' + product.id}
      prefetch={false}
      className="w-full"
      onClick={handleClick}
    >
      <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
        {actionIcon && <div className="absolute top-0 right-0 z-10">{actionIcon}</div>}
        <ProductThumbnail
          src={product?.thumbnail ?? ''}
          title={product.title}
          categoryId={product.categoryId}
          type="product"
          alt={product.title}
          width={252}
          height={252}
          sizes="252px"
        />
        {typeof rank === 'number' && (
          <div className="text-primary-500 absolute top-0 left-0 z-10 flex h-6.5 w-6.5 items-center justify-center rounded-br-lg bg-gray-900 text-sm">
            {rank}
          </div>
        )}
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
        <span className="line-clamp-2 h-12 pt-2 text-sm break-words text-gray-700">
          {product.title}
        </span>
        <div className="flex h-9 items-center pt-1">
          <span className="line-clamp-1 max-w-[98px] text-lg font-bold text-gray-900">
            {product?.price ?? ''}
          </span>
          {product?.price && <span className="w-2"></span>}
          <span className="text-sm text-gray-600">
            <DisplayTime time={product.postedAt} />
          </span>
        </div>
      </div>
    </Link>
  );
}
