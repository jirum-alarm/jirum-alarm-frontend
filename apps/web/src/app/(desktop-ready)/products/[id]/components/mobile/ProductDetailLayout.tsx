import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import SectionHeader from '@/components/SectionHeader';
import HorizontalProductListSkeleton from '@/features/products/components/skeleton/HorizontalProductListSkeleton';

import CommentSection from '../comment/CommentSection';
import CommunityReaction from '../CommunityReaction';
import ProductAdditionalInfoFetcher from '../fetcher/ProductAdditionalInfoFetcher';
import ProductGuidesFetcher from '../fetcher/ProductGuidesFetcher';
import ProductInfoFetcher from '../fetcher/ProductInfoFetcher';
import HotdealGuide from '../HotdealGuide';
import HotdealScore from '../HotdealScore';
import { NoticeProfitLink } from '../NoticeProfitUrl';
import PopularProductsContainer from '../PopularProudctsContainer';
import ProductDetailImage from '../ProductDetailImage';
import ProductExpiredBanner from '../ProductExpiredBanner';
import RelatedProductsContainer from '../RelatedProductsContainer';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';
import { ViewerCount } from './ViewerCount';

async function ProductDetailLayout({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  return (
    <ProductInfoFetcher productId={productId}>
      <Suspense
        fallback={<div className="sticky top-[56px] z-50 h-[48px] w-full bg-secondary-50" />}
      >
        <ViewerCount productId={productId} />
      </Suspense>

      <main className="pt-[56px]">
        <div className="sticky top-0 -mb-6">
          <div
            className="relative aspect-square w-full"
            style={{ contain: 'layout paint', contentVisibility: 'auto' }}
          >
            <Suspense
              fallback={<div className="relative aspect-square w-full rounded-b-3xl bg-gray-100" />}
            >
              <ProductDetailImage productId={productId} />
            </Suspense>
          </div>
        </div>

        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <div className="flex flex-col">
            <Suspense
              fallback={
                <div className="px-5">
                  <div className="h-6 w-4/5 rounded bg-gray-100" />
                  <div className="mt-3 h-5 w-20 rounded bg-gray-100" />
                  <div className="mt-4 flex justify-between">
                    <div className="h-6 w-24 rounded bg-gray-100" />
                    <div className="h-8 w-[88px] rounded bg-gray-100" />
                  </div>
                </div>
              }
            >
              <ProductInfo productId={productId} />
            </Suspense>

            <ErrorBoundary fallback={<Hr />}>
              <Suspense fallback={<Hr />}>
                <ProductExpiredBanner productId={productId} />
              </Suspense>
            </ErrorBoundary>

            <div className="mb-12 mt-4 flex flex-col gap-y-9 px-5">
              <Suspense
                fallback={
                  <div className="h-[160px] rounded-[12px] border border-gray-100 bg-gray-50" />
                }
              >
                <ProductGuidesFetcher productId={productId}>
                  <HotdealGuide productId={productId} />
                </ProductGuidesFetcher>
              </Suspense>
              <Suspense
                fallback={
                  <div className="h-[160px] rounded-[12px] border border-gray-100 bg-gray-50" />
                }
              >
                <ProductAdditionalInfoFetcher productId={productId}>
                  <CommunityReaction productId={productId} />
                  <HotdealScore productId={productId} />
                </ProductAdditionalInfoFetcher>
              </Suspense>
            </div>

            <Hr />
            <CommentSection productId={productId} />
            <Hr />

            <div className="mb-8 mt-7 flex flex-col gap-y-8 px-5">
              <RelatedProductsContainer productId={productId} />
              <Suspense
                fallback={
                  <section>
                    <SectionHeader shouldShowMobileUI={true} title="" />
                    <HorizontalProductListSkeleton />
                  </section>
                }
              >
                <PopularProductsContainer productId={productId} />
              </Suspense>
            </div>

            <NoticeProfitLink />
          </div>

          <div className="h-[64px] bg-gray-100" />
          <BottomCTA productId={productId} isUserLogin={isUserLogin} />
        </div>
      </main>
    </ProductInfoFetcher>
  );
}
export default ProductDetailLayout;

function Hr() {
  return <div className="h-[8px] bg-gray-100" />;
}
