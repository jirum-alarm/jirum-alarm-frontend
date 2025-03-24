'use client';
import 'swiper/css';
import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import React, { useState } from 'react';

import BottomCTA from './BottomCTA';
import CommunityReaction from './CommunityReaction';
import HotdealGuide from './HotdealGuide';
import PopularProductsContainer from './PopularProudctsContainer';
import ProductImage from './ProductImage';
import RelatedProductsContainer from './RelatedProductsContainer';

import { ProductQueries } from '@/entities/product';
import { cn } from '@/lib/cn';
import { HotDealType, ProductGuidesQuery, ProductQuery } from '@/shared/api/gql/graphql';
import { displayTime } from '@/util/displayTime';
import { NoticeProfitLink } from './NoticeProfitUrl';
import { useInView } from 'react-intersection-observer';
import { Info, Thumbsdown, Thumbsup } from '@/components/common/icons';
import HotdealScore from './HotdealScore';
import ProductReport from './ProductReport';
import ProductFeedback from './ProductFeedback';
import HotdealBadge from '@/features/products/components/HotdealBadge';
import { Drawer } from 'vaul';
import Button from '@/components/common/Button';

type Product = NonNullable<ProductQuery['product']>;
type ProductGuides = ProductGuidesQuery['productGuides'];

function ProductDetailLayout({
  productId,
  productGuides,
  isUserLogin,
}: {
  productGuides: ProductGuides;
  isUserLogin: boolean;
  productId: number;
}) {
  const {
    data: { product },
  } = useSuspenseQuery(ProductQueries.product({ id: productId }));

  if (!product) notFound();

  return (
    <>
      <main>
        <ProductImage product={{ title: product.title, thumbnail: product.thumbnail }} />
        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-8 shadow-sm">
          <ProductInfoLayout>
            <ProductInfo product={product} />
            <HotdealGuide productGuides={productGuides} />
            {/* TODO: wait for api */}
            {/* <HotdealIndex product={product} /> */}
            <HotdealScore product={product} />
            <CommunityReaction product={product} />
            <ProductReport product={product} />
            <Hr />
            <ProductFeedback product={product} />
            <RelatedProductsContainer product={product} />
            <PopularProductsContainer product={product} />
            <NoticeProfitLink />
          </ProductInfoLayout>
          <BottomCTA product={product} isUserLogin={isUserLogin} />
        </div>
      </main>
      <div className="h-[64px]"></div>
    </>
  );
}
export default ProductDetailLayout;

function Hr() {
  return <div className="h-[8px] bg-gray-100" />;
}

function ProductInfoLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-y-10">{children}</div>;
}

function ProductInfo({ product }: { product: Product }) {
  const [isView, setIsView] = useState(true);
  const { ref } = useInView({
    threshold: 1,
    onChange: (inView) => {
      setIsView(inView);
    },
  });
  return (
    <section>
      <div className="px-5">
        <div className="flex items-center gap-3 pb-2">
          {product.isEnd && (
            <div
              className={cn('border border-gray-400 bg-white px-2 text-gray-500', {
                'text-semibold flex h-[22px] items-center rounded-lg text-xs leading-[20px]': true,
              })}
            >
              판매종료
            </div>
          )}
          {!product.isEnd && product.hotDealType && (
            <div className="flex items-center gap-[8px]">
              <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
              <HotdealGuideModal />
            </div>
          )}
        </div>
        <h1 className="text-gray-800">{product.title}</h1>
        <div className="inline-flex items-center gap-x-3 pt-3">
          {product.price && <p className="text-xl font-semibold">{product.price}</p>}
          <span className="text-s text-gray-600">{displayTime(product.postedAt)}</span>
        </div>
      </div>
      <div className="px-5 pt-4">
        <div className="flex flex-col gap-[8px]">
          <div>
            <span className="mr-[16px] inline-block w-[69px] text-sm text-gray-500">쇼핑몰</span>
            <span className="text-sm font-medium text-gray-500">{product.mallName}</span>
          </div>
          {/* <div>
            <span className="mr-[16px] inline-block w-[69px] text-sm text-gray-500">업로드</span>
            <span className="text-sm font-medium text-gray-500">지름알림</span>
          </div> */}
          <div className="flex">
            <span className="mr-[16px] inline-block w-[69px] text-sm text-gray-500">
              추천/비추천
            </span>
            {/* className="inline-flex items-center text-sm font-medium text-gray-500" */}
            <div className="flex gap-3">
              <div className="flex items-center gap-1">
                <Thumbsup />
                <span className="text-sm font-medium text-gray-600">{product.likeCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Thumbsdown />
                <span className="text-sm font-medium text-gray-600">{product.dislikeCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div ref={ref} className="flex h-[42px] w-full justify-center">
        <div
          className={cn(
            `relative top-0 mt-7 flex h-[42px] w-full items-center justify-center bg-gray-100 text-sm text-gray-500 transition-all`,
            {
              'fixed top-[50px] z-50 mt-0 w-fit rounded-full border border-gray-100 px-5': !isView,
            },
          )}
        >
          지금&nbsp;
          <strong className="font-semibold text-secondary-700">
            {product.viewCount.toLocaleString('ko-kr')}명
          </strong>
          이 보고 있어요
        </div>
      </div>
    </section>
  );
}

const HotdealGuideModal = () => {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button aria-label="핫딜 기준 안내" title="핫딜 기준 안내">
          <Info />
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[9999] bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-[9999] mx-auto h-fit w-full max-w-screen-layout-max rounded-t-[20px] bg-white outline-none">
          <div className="flex flex-col items-center">
            <Drawer.Title asChild>
              <h2 className="pb-[12px] pt-[32px] text-xl font-bold">핫딜 기준 안내</h2>
            </Drawer.Title>
            <p className="pb-[90px] text-center text-gray-700">
              AI를 활용해서 상품의 기존 가격과 할인된 가격을
              <br />
              비교해서 3단계로 구분해드려요!
            </p>
            <div className="w-[311px]">
              <div className="flex h-[20px] w-full items-center justify-around gap-[12px] rounded-[40px] bg-gradient-to-r from-[#FFEEE0] from-0% via-[#FFC0B2] via-[27%] to-[#FF4639] to-100%">
                {/* {Array.from({ length: 4 }, (_, i) => i).map((v) => ( */}
                <div className="relative h-[12px] w-[12px] rounded-full bg-white">
                  <div className="absolute -left-[calc(66px/2-6px)] -top-[calc(30px+12px)] inline-flex flex-col items-center">
                    <div
                      className={cn(
                        `flex h-[24px] w-[66px] items-center justify-center rounded-[8px] bg-gray-200 text-sm font-semibold text-gray-800`,
                      )}
                    >
                      기존 가격
                    </div>
                    <svg
                      className="-mt-[2px]"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 8L0.669873 0.499999L9.33013 0.5L5 8Z" fill="#E4E7EC" />
                    </svg>
                  </div>
                </div>
                <div className="relative h-[12px] w-[12px] rounded-full bg-white">
                  <div className="absolute -left-[calc(57px/2-6px)] -top-[calc(30px+12px)] inline-flex flex-col items-center">
                    <HotdealBadge badgeVariant="page" hotdealType={HotDealType.HotDeal} />
                    <svg
                      className="-mt-[2px]"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 8L0.669873 0.499999L9.33013 0.5L5 8Z" fill="#E25F03" />
                    </svg>
                  </div>
                </div>

                <div className="relative h-[12px] w-[12px] rounded-full bg-white">
                  <div className="absolute -left-[calc(57px/2-6px)] -top-[calc(30px+12px)] inline-flex flex-col items-center">
                    <HotdealBadge badgeVariant="page" hotdealType={HotDealType.SuperDeal} />
                    <svg
                      className="-mt-[2px]"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 8L0.669873 0.499999L9.33013 0.5L5 8Z" fill="#EC0621" />
                    </svg>
                  </div>
                </div>

                <div className="relative h-[12px] w-[12px] rounded-full bg-white">
                  <div className="absolute -left-[calc(62px/2-6px)] -top-[calc(30px+12px)] inline-flex flex-col items-center">
                    <HotdealBadge badgeVariant="page" hotdealType={HotDealType.UltraDeal} />
                    <svg
                      className="-mt-[2px]"
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M5 8L0.669873 0.499999L9.33013 0.5L5 8Z" fill="#C00017" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="-mr-4 flex justify-end pt-[8px] text-sm text-gray-600">
                할인율이 높아져요
              </div>
            </div>
            <div className="mt-[34px] flex w-full p-5">
              <Drawer.Close asChild>
                <Button>확인</Button>
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
