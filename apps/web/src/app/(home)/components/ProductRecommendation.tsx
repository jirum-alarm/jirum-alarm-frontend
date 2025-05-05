import { PAGE } from '@/constants/page';
import HorizontalProductCarousel from '@/features/carousel/HorizontalProductCarousel';
import Link from '@/features/Link';
import { ProductImageCard } from '@/features/products';
import { IProduct } from '@/graphql/interface';
import useScreenSize from '@/hooks/useScreenSize';

/**
 * @deprecated
 */
export default function ProductRecommendation({
  showRandomHotDeals,
  products,
  hotDeals,
}: {
  showRandomHotDeals: boolean;
  products: IProduct[] | undefined;
  hotDeals: IProduct[] | undefined;
}) {
  const { lg, md, sm } = useScreenSize();
  const firstRenderingCount = lg ? 15 : md ? 12 : sm ? 9 : 6;
  const hotDealCount = 10;

  const handleShowMoreClick = () => {
    // TODO: Need GTM Migration
    // mp?.track(EVENT.SHOW_MORE_HOT_DEALS_CLICK.NAME, {
    //   page: EVENT.PAGE.HOME,
    // });
  };

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 pb-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
        {products
          ?.slice(0, firstRenderingCount)
          .map((product, i) => (
            <ProductImageCard key={i} product={product} logging={{ page: 'HOME' }} />
          ))}
      </div>

      {showRandomHotDeals && hotDeals && (
        <div className="py-6">
          <div className="flex w-full items-center justify-between pb-4 ">
            <span className=" text-lg font-semibold text-gray-900">오늘 가장 인기있는 핫딜</span>
            <span className="text-sm text-gray-500">
              <Link onClick={handleShowMoreClick} href={PAGE.HOME + '/?categoryId=0'}>
                더보기
              </Link>
            </span>
          </div>

          <HorizontalProductCarousel
            products={hotDeals}
            type="hotDeal"
            maxItems={hotDealCount}
            logging={{ page: 'HOME' }}
          />
        </div>
      )}
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
        {products
          ?.slice(firstRenderingCount)
          .map((product, i) => (
            <ProductImageCard key={i} product={product} logging={{ page: 'HOME' }} />
          ))}
      </div>
    </>
  );
}
