import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { IProduct } from '@/graphql/interface';
import useScreenSize from '@/hooks/useScreenSize';
import { mp } from '@/lib/mixpanel';
import { EVENT } from '@/constants/mixpanel';
import Link from '@/features/Link';
import { PAGE } from '@/constants/page';
import { ProductImageCard, useCollectProduct } from '@/features/products';

export default function ProductRecommendation({
  showRandomHotDeals,
  products,
  hotDeals,
}: {
  showRandomHotDeals: boolean;
  products: IProduct[] | undefined;
  hotDeals: IProduct[] | undefined;
}) {
  const collectProduct = useCollectProduct();

  const { lg, md, sm } = useScreenSize();
  const firstRenderingCount = lg ? 15 : md ? 12 : sm ? 9 : 6;
  const hotDealCount = 10;

  const handleShowMoreClick = () => {
    mp.track(EVENT.SHOW_MORE_HOT_DEALS_CLICK.NAME, {
      page: EVENT.PAGE.HOME,
    });
  };

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 pb-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
        {products
          ?.slice(0, firstRenderingCount)
          .map((product, i) => (
            <ProductImageCard
              key={i}
              product={product}
              collectProduct={collectProduct}
              logging={{ page: 'HOME' }}
            />
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
          <div
            onTouchStartCapture={(e) => {
              e.stopPropagation();
            }}
            onTouchMoveCapture={(e) => {
              e.stopPropagation();
            }}
          >
            <Swiper
              spaceBetween={12}
              slidesPerView={2.5}
              breakpoints={{
                640: { slidesPerView: 3.5 },
                1024: { slidesPerView: 5.5 },
              }}
            >
              {hotDeals.slice(0, hotDealCount).map((hotDeal, i) => (
                <SwiperSlide key={i}>
                  <ProductImageCard
                    product={hotDeal}
                    type="hotDeal"
                    collectProduct={collectProduct}
                    logging={{ page: 'HOME' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
        {products
          ?.slice(firstRenderingCount)
          .map((product, i) => (
            <ProductImageCard
              key={i}
              product={product}
              collectProduct={collectProduct}
              logging={{ page: 'HOME' }}
            />
          ))}
      </div>
    </>
  );
}
