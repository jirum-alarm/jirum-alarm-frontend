'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { Drawer } from 'vaul';

import Button from '@/components/common/Button';
import Jirume from '@/components/common/icons/Jirume';
import TopButton from '@/components/TopButton';
import { ProductQueries } from '@/entities/product';
import HotdealBadge from '@/features/products/components/HotdealBadge';
import { useIsHydrated } from '@/hooks/useIsHydrated';
import { cn } from '@/lib/cn';
import { HotDealType, ProductGuidesQuery, ProductQuery } from '@/shared/api/gql/graphql';
import { displayTime } from '@/util/displayTime';

import BottomCTA from './BottomCTA';
import CommunityReaction from './CommunityReaction';
import HotdealGuide from './HotdealGuide';
import HotdealScore from './HotdealScore';
import { NoticeProfitLink } from './NoticeProfitUrl';
import PopularProductsContainer from './PopularProudctsContainer';
import ProductImage from './ProductImage';
import ProductReport from './ProductReport';
import RecommendButton from './RecommendButton';
import RelatedProductsContainer from './RelatedProductsContainer';
import { ViewerCount } from './ViewerCount';

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
  console.log(product);
  return (
    <>
      <main className="pt-[56px]">
        <ViewerCount count={product.viewCount} />
        <ProductImage
          product={{
            title: product.title,
            thumbnail: product.thumbnail,
          }}
        />
        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-6 shadow-sm">
          <ProductInfoLayout>
            <ProductInfo product={product} />
            <ProductExpiredBanner product={product} />
            <div className="mb-12 flex flex-col gap-y-9">
              <HotdealGuide productGuides={productGuides} />
              {/* TODO: wait for api */}
              {/* <HotdealIndex product={product} /> */}
              <HotdealScore product={product} />
              <CommunityReaction product={product} />
              <ProductReport product={product} />
            </div>
            <Hr />
            <div className="mt-7 flex flex-col gap-y-8">
              {/* <ProductFeedback product={product} /> */}
              <RelatedProductsContainer product={product} />
              <PopularProductsContainer product={product} />
            </div>
            <NoticeProfitLink />
          </ProductInfoLayout>
          <BottomCTA product={product} isUserLogin={isUserLogin} />
        </div>
      </main>
      <TopButton />
      <div className="h-[64px]"></div>
    </>
  );
}
export default ProductDetailLayout;

function Hr() {
  return <div className="h-[8px] bg-gray-50" />;
}

function ProductInfoLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

function ProductExpiredBanner({ product }: { product: Product }) {
  return (
    <div className="flex h-[48px] items-center justify-center bg-gray-50">
      {/* <p className="font-medium text-gray-600">
        <strong className="font-bold">판매종료</strong>로 제보했어요!
      </p> */}
    </div>
  );
}

function ProductInfo({ product }: { product: Product }) {
  const priceWithoutWon = product.price ? product.price.replace('원', '').trim() : null;
  const isHydrated = useIsHydrated();

  const author = {
    id: 'admin',
    nickname: '지름알림',
  };

  return (
    <section className="px-5 pb-9">
      <div>
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
              <HotdealGuideModal
                trigger={
                  <button aria-label="핫딜 기준 안내" title="핫딜 기준 안내">
                    <HotdealBadge badgeVariant="page" hotdealType={product.hotDealType} />
                  </button>
                }
              />
            </div>
          )}
        </div>
        <h1 className="font-medium text-gray-800">{product.title}</h1>
        <div className="flex flex-col gap-y-1 pt-3">
          <span className="text-sm text-gray-600">
            {isHydrated ? displayTime(product.postedAt) : ''}
          </span>
          <div className="flex items-center justify-between">
            <div>
              {priceWithoutWon && (
                <p className="text-lg font-bold text-gray-500">
                  <strong className="mr-0.5 text-2xl font-semibold text-gray-900">
                    {priceWithoutWon}
                  </strong>
                  원
                </p>
              )}
            </div>
            <div>
              <RecommendButton product={product} />
            </div>
          </div>
        </div>
      </div>
      <div className="pt-4">
        <div className="flex flex-col gap-[8px]">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-gray-400">쇼핑몰</span>
            <span className="text-gray-500">{product.mallName}</span>
          </div>
          {author && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">업로드</span>
              <span
                className={cn('flex items-center gap-1 text-gray-500', {
                  'text-primary-800': author.id === 'admin',
                })}
              >
                {author.id === 'admin' && <Jirume width={18} height={18} />}
                {author.nickname}
              </span>
            </div>
          )}
          {!!product.likeCount && (
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-400">추천수</span>
              <span className="text-gray-500">{product.likeCount}개</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const HotdealGuideModal = ({ trigger }: { trigger: React.ReactNode }) => {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>{trigger}</Drawer.Trigger>
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
