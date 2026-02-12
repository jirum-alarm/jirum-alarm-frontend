import { Suspense } from 'react';

import { ProductInfoFragment } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';

import ProductDetailImage from '@/entities/product/ui/ProductDetailImage';

import CommentSection from '@/features/product-comment/ui/CommentSection';
import { ExpiredProductWarning } from '@/features/product-detail/components';
import CoupangPartnerGuide from '@/features/product-detail/ui/CoupangPartnerGuide';
import HotdealGuide from '@/features/product-detail/ui/HotdealGuide';
import HotdealScore from '@/features/product-detail/ui/HotdealScore';
import NoticeProfitLink from '@/features/product-detail/ui/NoticeProfitUrl';
import { CategoryPopularByProductSection, TogetherViewedSection } from '@/features/product-list/ui';

import CommunityReaction from '../CommunityReaction';

import ProductInfo from './ProductInfo';

export default async function DesktopProductDetailPage({
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
      <div className="max-w-layout-max mx-auto grid grid-cols-12 gap-x-6">
        <div
          className="col-span-10 col-start-2 grid grid-cols-2 gap-x-12 gap-y-10"
          style={{ gridTemplateRows: 'min-content 1fr' }}
        >
          <div className="col-span-1 space-y-10">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200">
                <ProductDetailImage
                  productId={productId}
                  fill={false}
                  initialData={initialProduct}
                />
              </div>
              <CoupangPartnerGuide productId={productId} />
            </div>

            {initialProduct && <ExpiredProductWarning product={initialProduct} isMobile={false} />}

            <div className="space-y-12">
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <HotdealGuide fixExpanded={true} productId={productId} />
              </Suspense>
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <HotdealScore productId={productId} />
              </Suspense>
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <CommunityReaction productId={productId} />
              </Suspense>
            </div>
          </div>

          <div className="col-span-1">
            <div className="sticky top-25">
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <ProductInfo productId={productId} isUserLogin={isUserLogin} />
              </Suspense>
            </div>
          </div>
          <div className="col-span-2 pt-5">
            <Hr />
            <div className="space-y-11 overflow-x-hidden py-11">
              <div>
                <CommentSection productId={productId} isUserLogin={isUserLogin} isMobile={false} />
              </div>
              <Hr />
              <div>
                <Suspense>
                  <TogetherViewedSection productId={productId} />
                </Suspense>
                <Suspense>
                  <CategoryPopularByProductSection productId={productId} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NoticeProfitLink productId={productId} />
    </>
  );
}

function Hr({ className }: { className?: string }) {
  return <div className={cn('h-[8px] bg-gray-100', className)} />;
}
