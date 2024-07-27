import ProductTrendingImageCard from '@/features/products/components/ProductTrendingImageCard';
import useTrendingViewModel from '../hooks/useTrendingViewModel';
import { LoadingSpinner } from '@/components/common/icons';
import { Swiper, SwiperSlide, useSwiper } from 'swiper/react';
import { ProductImageCard, useCollectProduct } from '@/features/products';

interface TrendingListProps {
  categoryId: number | null;
  categoryName: string;
  isActive: boolean;
}

const firstRenderingCount = 10;

const TrendingList = ({ categoryId, categoryName, isActive }: TrendingListProps) => {
  const { products, liveProducts, loadingCallbackRef, isPending } = useTrendingViewModel({
    categoryId,
    isActive,
  });

  const collectProduct = useCollectProduct();
  const swiper = useSwiper();

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-2 gap-y-2">
        {products
          ?.slice(0, firstRenderingCount)
          .map((product, i) => (
            <ProductTrendingImageCard
              key={product.id}
              product={product}
              rank={i + 1}
              collectProduct={collectProduct}
              logging={{ page: 'TRENDING' }}
            />
          ))}
      </div>
      {liveProducts && (
        <div className="py-10">
          <div className="flex w-full items-center justify-between pb-4 ">
            <span className="font-semibold text-gray-900">{`‘${categoryName}’ 실시간 핫딜`}</span>
          </div>
          <div>
            <Swiper
              spaceBetween={12}
              slidesPerView={2.5}
              onTouchStart={() => {
                swiper.allowTouchMove = false;
              }}
              onTouchEnd={() => {
                swiper.allowTouchMove = true;
              }}
            >
              {liveProducts.map((hotDeal, i) => (
                <SwiperSlide key={i}>
                  <ProductImageCard
                    product={hotDeal}
                    type="hotDeal"
                    collectProduct={collectProduct}
                    logging={{ page: 'TRENDING' }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-2 gap-y-2">
        {products
          ?.slice(firstRenderingCount)
          .map((product, i) => (
            <ProductTrendingImageCard
              key={product.id}
              product={product}
              rank={i + firstRenderingCount + 1}
              collectProduct={collectProduct}
              logging={{ page: 'TRENDING' }}
            />
          ))}
      </div>
      <div className="flex w-full items-center justify-center pb-6 pt-3" ref={loadingCallbackRef}>
        {isPending && <LoadingSpinner />}
      </div>
    </div>
  );
};

export default TrendingList;