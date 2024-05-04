import React from 'react';
import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { IProduct } from '@/graphql/interface';
import { cn } from '@/lib/cn';
import useScreenSize from '@/hooks/useScreenSize';

export default function ProductRecommendation({
  products,
  hotDeals,
}: {
  products: IProduct[];
  hotDeals: IProduct[] | undefined;
}) {
  const { lg, md, sm } = useScreenSize();
  const firstRenderingCount = lg ? 15 : md ? 12 : sm ? 9 : 6;

  return (
    <>
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
        {products
          ?.slice(0, firstRenderingCount)
          .map((product, i) => <ProductImageCard key={i} product={product} />)}
      </div>
      <div className="pb-4 pt-9">
        <span className=" text-lg font-semibold text-gray-900">오늘 가장 인기있는 핫딜</span>
      </div>
      {hotDeals && (
        <div
          className="pb-11"
          onTouchStartCapture={(e) => {
            e.stopPropagation();
          }}
          onTouchMoveCapture={(e) => {
            e.stopPropagation();
          }}
        >
          <Swiper
            spaceBetween={12}
            slidesPerView={3}
            breakpoints={{
              768: { slidesPerView: 4 },
              1024: { slidesPerView: 5 },
            }}
          >
            {hotDeals.map((hotDeal, i) => (
              <SwiperSlide key={i}>
                <ProductImageCard product={hotDeal} type="hotDeal" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
      <div className="grid grid-cols-2 justify-items-center gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 md:gap-x-5 lg:grid-cols-5 lg:gap-x-6">
        {products
          ?.slice(firstRenderingCount)
          .map((product, i) => <ProductImageCard key={i} product={product} />)}
      </div>
    </>
  );
}

function ProductImageCard({
  product,
  type = 'product',
}: {
  product: IProduct;
  type?: 'product' | 'hotDeal';
}) {
  return (
    <a
      href={product.url}
      className={cn({
        'w-[162px] txs:w-[140px]': type === 'product',
        'w-[120px]': type === 'hotDeal',
      })}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div
        className={cn({
          'relative overflow-hidden rounded-lg': true,
          'h-[162px] txs:h-[140px]': type === 'product',
          'h-[120px]': type === 'hotDeal',
        })}
      >
        {type === 'product' && (
          <div
            className={cn({
              'text-semibold absolute bottom-0 left-0 flex h-[22px] items-center rounded-bl-lg rounded-tr-lg text-xs':
                true,
              'bg-error-500 px-3 text-white ': product.isHot,
              'border border-gray-400 bg-white px-2 text-gray-500': product.isEnd,
            })}
          >
            {product.isHot ? '핫딜' : product.isEnd ? '판매종료' : ''}
          </div>
        )}
        {product?.thumbnail ? (
          <Image src={product?.thumbnail} width={162} height={162} alt={product.title} />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <span className="text-center text-sm text-gray-300">
              상품 이미지
              <br />
              준비중입니다
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col">
        <span className="pt-2 text-sm text-gray-700">{product.title}</span>
        <span className="align-center flex h-8 pt-1 text-lg font-semibold text-gray-900">
          {product?.price ?? ''}
        </span>
      </div>
    </a>
  );
}
