import Link from '@/features/Link';

import ImageWithFallback from '@/components/ImageWithFallback';
import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import { cn } from '@/lib/cn';
import { mp } from '@/components/Mixpanel';
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
  const handleClick = () => {
    collectProduct(+product.id);

    mp?.track(EVENT.PRODUCT_CLICK.NAME, {
      product,
      page: EVENT.PAGE[logging.page],
    });
  };
  return (
    <Link
      href={PAGE.DETAIL + '/' + product.id}
      prefetch={false}
      className={cn('w-full')}
      onClick={handleClick}
    >
      <div className={'relative aspect-square overflow-hidden rounded-lg border border-gray-200'}>
        {product.isEnd && (
          <div
            className={cn('border border-gray-400 bg-white px-2 text-gray-500', {
              'text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs':
                true,
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
        <ImageWithFallback
          src={product?.thumbnail ?? ''}
          alt={product.title}
          fill
          className="object-cover"
          sizes="300px"
        />
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
          <span className="text-sm text-gray-600">{displayTime(product.postedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
