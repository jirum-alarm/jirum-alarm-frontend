'use client';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { useCollectProduct } from '@/features/products';
import { ProductRankingImageCard } from '@/features/products/components/ProductRankingImageCard';
import { SwiperSlide, Swiper } from 'swiper/react';
import { IProductsRankingOutput } from '@/graphql/interface';

interface Props {
  products: IProductsRankingOutput;
}

const JirumRankingSlider = ({ products: { products } }: Props) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const collectProduct = useCollectProduct();

  return (
    <div>
      <Swiper
        centeredSlides={true}
        slidesPerView={1.5577}
        loop={true}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
      >
        {products.map((product, i) => (
          <SwiperSlide key={product.id} className="pb-2">
            <ProductRankingImageCard
              activeIndex={activeIndex}
              index={i}
              product={product}
              logging={{ page: 'HOME' }}
              collectProduct={collectProduct}
            />
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="mt-3 flex h-[20px] w-full items-center justify-center">
        {Array.from({ length: products.length }).map((_, i) => (
          <div
            key={i}
            className={cn(`h-[3px] w-[3px] bg-gray-400`, {
              'ml-[6px] mr-[6px] h-[4px] w-[4px] bg-gray-600': activeIndex === i,
            })}
          />
        ))}
      </div>
    </div>
  );
};

export default JirumRankingSlider;
