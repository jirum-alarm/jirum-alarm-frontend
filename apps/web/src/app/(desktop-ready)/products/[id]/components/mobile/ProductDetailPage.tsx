import { Suspense } from 'react';

import {
  CommunityReaction,
  HotdealGuide,
  HotdealScore,
  NoticeProfitLink,
  ProductDetailImage,
  ProductExpiredBanner,
} from '@features/product-detail/components';
import {
  CategoryPopularByProductSection,
  TogetherViewedSection,
} from '@features/products/sections';

import CommentSection from '../comment/CommentSection';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';
import ViewerCount from './ViewerCount';

function ProductDetailPage({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  return (
    <>
      <Suspense>
        <ViewerCount productId={productId} />
      </Suspense>

      <main className="pt-14">
        <Suspense>
          <div className="sticky top-0 -mb-6">
            <div
              className="relative aspect-square w-full"
              style={{ contain: 'layout paint', contentVisibility: 'auto' }}
            >
              <ProductDetailImage productId={productId} fill />
            </div>
          </div>
        </Suspense>

        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <div className="flex flex-col">
            <Suspense>
              <ProductInfo productId={productId} />
            </Suspense>

            <Suspense fallback={<Hr />}>
              <ProductExpiredBanner productId={productId} />
            </Suspense>

            <div className="mt-4 mb-12 flex flex-col gap-y-9 px-5">
              <Suspense>
                <HotdealGuide productId={productId} />
              </Suspense>
              <Suspense>
                <CommunityReaction productId={productId} />
              </Suspense>
              <Suspense>
                <HotdealScore productId={productId} />
              </Suspense>
            </div>

            <Hr />
            <CommentSection productId={productId} isUserLogin={isUserLogin} isMobile={true} />
            <Hr />

            <div className="mt-7 mb-8 flex flex-col gap-y-8">
              <TogetherViewedSection productId={productId} />
              <CategoryPopularByProductSection productId={productId} />
            </div>

            <NoticeProfitLink />
          </div>

          <div className="h-[64px] bg-gray-100" />
          <BottomCTA productId={productId} isUserLogin={isUserLogin} />
        </div>
      </main>
    </>
  );
}
export default ProductDetailPage;

function Hr() {
  return <div className="h-[8px] bg-gray-100" />;
}
