import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import {
  CommunityReaction,
  HotdealGuide,
  HotdealScore,
  NoticeProfitLink,
  ProductDetailImage,
  ProductExpiredBanner,
} from '@features/product-detail/components';
import {
  ProductAdditionalInfoPrefetch,
  ProductGuidesPrefetch,
  ProductInfoPrefetch,
} from '@features/product-detail/prefetch';
import {
  CategoryPopularByProductSection,
  TogetherViewedSection,
} from '@features/products/sections';

import CommentSection from '../comment/CommentSection';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';
import ViewerCount from './ViewerCount';

async function ProductDetailPage({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  return (
    <ProductInfoPrefetch productId={productId}>
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
              <ProductDetailImage productId={productId} fill />
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
                <ProductGuidesPrefetch productId={productId}>
                  <HotdealGuide productId={productId} />
                </ProductGuidesPrefetch>
              </Suspense>
              <Suspense
                fallback={
                  <div className="h-[160px] rounded-[12px] border border-gray-100 bg-gray-50" />
                }
              >
                <ProductAdditionalInfoPrefetch productId={productId}>
                  <CommunityReaction productId={productId} />
                  <HotdealScore productId={productId} />
                </ProductAdditionalInfoPrefetch>
              </Suspense>
            </div>

            <Hr />
            <CommentSection productId={productId} />
            <Hr />

            <div className="mb-8 mt-7 flex flex-col gap-y-8 px-5">
              <TogetherViewedSection productId={productId} />
              <CategoryPopularByProductSection productId={productId} />
            </div>

            <NoticeProfitLink />
          </div>

          <div className="h-[64px] bg-gray-100" />
          <BottomCTA productId={productId} isUserLogin={isUserLogin} />
        </div>
      </main>
    </ProductInfoPrefetch>
  );
}
export default ProductDetailPage;

function Hr() {
  return <div className="h-[8px] bg-gray-100" />;
}
