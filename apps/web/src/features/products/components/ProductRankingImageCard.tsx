import Link from '@/features/Link';

import ImageWithFallback from '@/components/ImageWithFallback';
import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import { cn } from '@/lib/cn';
import { mp } from '@/lib/mixpanel';
import { type QueryRankingProductsQuery } from '@/shared/api/gql/graphql';

export function ProductRankingImageCard({
  product,
  collectProduct,
  logging,
  activeIndex,
  index,
}: {
  product: QueryRankingProductsQuery['rankingProducts'][number];
  collectProduct: (productId: number) => void;
  logging: { page: keyof typeof EVENT.PAGE };
  activeIndex: number;
  index: number;
}) {
  const handleClick = () => {
    collectProduct(+product.id);
    setTimeout(() => {
      mp.track(EVENT.PRODUCT_CLICK.NAME, {
        product,
        page: EVENT.PAGE[logging.page],
      });
    }, 0);
  };

  return (
    <Link href={PAGE.DETAIL + '/' + product.id} onClick={handleClick} rel="preload">
      <div
        className={cn(
          'h-[340px] w-full origin-center overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all',
          activeIndex === index ? 'scale-100' : 'scale-90',
        )}
      >
        <div className="relative h-[240px] w-full">
          <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-900 text-sm text-primary-500">
            {index + 1}
          </div>
          <ImageWithFallback
            src={product.thumbnail ?? ''}
            alt={product.title}
            fill
            className="object-cover"
            priority={[0, 1, 9].includes(index)}
          />
        </div>
        <div className="p-3 pb-0">
          <div className="line-clamp-2 text-sm text-gray-700">{product.title}</div>
          <div className="pt-2 text-lg font-bold text-gray-900">{product.price ?? ''}</div>
        </div>
      </div>
    </Link>
  );
}
