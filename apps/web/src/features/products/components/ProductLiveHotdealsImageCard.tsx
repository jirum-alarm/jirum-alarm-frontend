import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';
import ProductImage from '@/features/products/components/ProductImage';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';
import { type QueryProductsQuery } from '@/shared/api/gql/graphql';
import { displayTime } from '@/util/displayTime';

import HotdealBadge from './HotdealBadge';

export function ProductLiveHotdealsImageCard({
  product,
  collectProduct,
  logging,
}: {
  product: QueryProductsQuery['products'][number];
  collectProduct: (productId: number) => void;
  logging: { page: keyof typeof EVENT.PAGE };
}) {
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
      className={cn('w-full')}
      onClick={handleClick}
    >
      <div className={'relative aspect-square overflow-hidden rounded-lg border border-gray-200'}>
        <ProductImage
          src={product?.thumbnail ?? ''}
          title={product.title}
          categoryId={product.categoryId}
          type="product"
          alt={product.title}
          width={162}
          height={162}
          sizes="(max-width: 320px) 140px, 162px"
          className="object-cover"
        />
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
          <span className="line-clamp-1 max-w-[98px] text-lg font-bold text-gray-900">
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
}
