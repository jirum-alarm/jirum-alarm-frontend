import { EVENT } from '@/constants/mixpanel';
import { PAGE } from '@/constants/page';
import Link from '@/features/Link';
import ProductImage from '@/features/products/components/ProductImage';
import { cn } from '@/lib/cn';
import { type QueryRankingProductsQuery } from '@/shared/api/gql/graphql';

export function ProductRankingImageCard({
  product,
  collectProduct,
  logging,
  activeIndex,
  index,
  isMobile,
}: {
  product: QueryRankingProductsQuery['rankingProducts'][number];
  collectProduct: (productId: number) => void;
  logging: { page: keyof typeof EVENT.PAGE };
  activeIndex: number;
  index: number;
  isMobile: boolean;
}) {
  const imageSize = isMobile ? 240 : 252;

  const handleClick = () => {
    collectProduct(+product.id);

    // setTimeout(() => {
    //   mp?// mp?.track(EVENT.PRODUCT_CLICK.NAME, {
    //     product,
    //     page: EVENT.PAGE[logging.page],
    //   });
    // }, 0);
  };

  return (
    <Link href={PAGE.DETAIL + '/' + product.id} onClick={handleClick} rel="preload">
      <div
        className={cn(
          'w-full origin-center overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] transition-all',
          isMobile && 'h-[340px] scale-90 transition-all duration-300',
          isMobile && activeIndex === index && 'scale-100',
          //  !isMobile && 'h-[350px] xl:h-[362px]',
        )}
      >
        <div className={cn('relative h-[240px] w-full', !isMobile && 'lg:aspect-square lg:h-auto')}>
          <div className="absolute left-0 top-0 z-10 flex h-[26px] w-[26px] items-center justify-center rounded-br-lg bg-gray-900 text-sm font-medium text-primary-500">
            {index + 1}
          </div>
          <ProductImage
            src={product.thumbnail ?? ''}
            title={product.title}
            type="product"
            categoryId={product.categoryId}
            alt={product.title}
            width={imageSize}
            height={imageSize}
            sizes={`${imageSize}px`}
            className="object-cover"
            priority={[0, 1, 9].includes(index)}
          />
        </div>
        <div className={cn('p-3 pb-0', !isMobile && 'h-[110px]')}>
          <div className={cn('line-clamp-2 text-sm text-gray-700', !isMobile && 'xl:text-base')}>
            {product.title}
          </div>
          <div
            className={cn(
              'text-lg font-bold text-gray-900',
              !isMobile && 'h-[36px] pt-0.5 xl:text-[22px]',
              isMobile && 'pt-2',
            )}
          >
            {product.price ?? ''}
          </div>
        </div>
      </div>
    </Link>
  );
}
