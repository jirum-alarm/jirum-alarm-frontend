import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';
import ProductImage from '@/features/products/components/ProductImage';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';
import { QueryProductsQuery } from '@/shared/api/gql/graphql';
import { displayTime } from '@/util/displayTime';

import { useCollectProduct } from '../hooks';

import HotdealBadge from './HotdealBadge';

export const ProductTrendingImageCard = ({
  product,
  rank,
  logging,
}: {
  product: QueryProductsQuery['products'][number];
  rank: number;
  logging: { page: keyof typeof EVENT.PAGE };
}) => {
  const collectProduct = useCollectProduct();
  const isHydrated = useIsHydrated();

  const handleClick = () => {
    collectProduct(+product.id);

    // TODO: Need GTM Migration
    // mp?.track(EVENT.PRODUCT_CLICK.NAME, {
    //   product,
    //   page: EVENT.PAGE[logging.page],
    // });
  };
  return (
    <Link
      href={PAGE.DETAIL + '/' + product.id}
      prefetch={false}
      className="w-full"
      onClick={handleClick}
    >
      <div className={'relative aspect-square overflow-hidden rounded-lg border border-gray-200'}>
        <ProductImage
          src={product?.thumbnail ?? ''}
          title={product.title}
          type="product"
          categoryId={product.categoryId}
          alt={product.title}
          width={240}
          height={240}
          sizes="240px"
          className="object-cover"
        />
        <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-900 text-sm text-primary-500">
          {rank}
        </div>
        {product.isEnd && (
          <div
            className={cn('bg-white px-2 text-gray-700', {
              'text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs': true,
            })}
          >
            판매종료
          </div>
        )}
        {!product.isEnd && product.hotDealType && (
          <div className="absolute bottom-0 left-0 z-10">
            <HotdealBadge badgeVariant="card" hotdealType={product.hotDealType} />
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span
          className={cn({
            'line-clamp-2 h-12 break-words pt-2 text-sm text-gray-700': true,
          })}
        >
          {product.title}
        </span>
        <div className="flex h-9 items-center pt-1">
          <span className="line-clamp-1 max-w-[98px] text-lg font-semibold text-gray-900">
            {product?.price ?? ''}
          </span>
          {product?.price && <span className="w-2"></span>}
          <span className="text-sm text-gray-600">
            {isHydrated ? displayTime(product.postedAt) : ''}
          </span>
        </div>
      </div>
    </Link>
  );
};
