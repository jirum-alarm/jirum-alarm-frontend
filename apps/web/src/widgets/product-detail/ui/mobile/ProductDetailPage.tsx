import ProductDetailImage from '@/entities/product/ui/ProductDetailImage';
import { Suspense } from 'react';

import { ProductInfoFragment } from '@/shared/api/gql/graphql';


import CommentSection from '@/features/product-comment/ui/CommentSection';
import { ExpiredProductWarning } from '@/features/product-detail/components';
import CoupangPartnerGuide from '@/features/product-detail/ui/CoupangPartnerGuide';
import HotdealGuide from '@/features/product-detail/ui/HotdealGuide';
import HotdealScore from '@/features/product-detail/ui/HotdealScore';
import ViewerCount from '@/features/product-detail/ui/mobile/ViewerCount';
import NoticeProfitLink from '@/features/product-detail/ui/NoticeProfitUrl';
import { CategoryPopularByProductSection, TogetherViewedSection } from '@/features/product-list/ui';

import CommunityReaction from '../CommunityReaction';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';

function ProductDetailPage({
  productId,
  isUserLogin,
  initialProduct,
}: {
  productId: number;
  isUserLogin: boolean;
  initialProduct?: ProductInfoFragment;
}) {
  return (
    <>
      <ViewerCount productId={productId} />

      <main className="pt-14">
        <div className="sticky top-0 -mb-6">
          <div className="relative aspect-square w-full">
            <ProductDetailImage productId={productId} fill initialData={initialProduct} />
          </div>
        </div>
        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <div className="flex flex-col">
            <ProductInfo productId={productId} />

            <CoupangPartnerGuide productId={productId} />

            {initialProduct && <ExpiredProductWarning product={initialProduct} isMobile={true} />}

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

            <NoticeProfitLink productId={productId} />
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
