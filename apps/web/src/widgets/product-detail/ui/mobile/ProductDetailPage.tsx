import { Suspense } from 'react';

import { ProductDetailImage } from '@entities/product';

import { CommentSection } from '@/features/product-comment';
import {
  CoupangPartnerGuide,
  HotdealGuide,
  HotdealScore,
  MobileViewerCount,
  NoticeProfitUrl,
} from '@/features/product-detail';
import { CategoryPopularByProductSection, TogetherViewedSection } from '@/features/product-list';

import CommunityReaction from '../CommunityReaction';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';

function ProductDetailPage({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  return (
    <>
      <MobileViewerCount productId={productId} />

      <main className="pt-14">
        <div className="sticky top-0 -mb-6">
          <div
            className="relative aspect-square w-full"
            style={{ contain: 'layout paint', contentVisibility: 'auto' }}
          >
            <ProductDetailImage productId={productId} fill />
          </div>
        </div>
        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <div className="flex flex-col">
            <ProductInfo productId={productId} />

            <CoupangPartnerGuide productId={productId} />

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

            <div className="mt-7 mb-8 space-y-8">
              <Suspense>
                <TogetherViewedSection productId={productId} />
              </Suspense>
              <Suspense>
                <CategoryPopularByProductSection productId={productId} />
              </Suspense>
            </div>

            <NoticeProfitUrl productId={productId} />
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
