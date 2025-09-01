import { Suspense } from 'react';

import { cn } from '@/lib/cn';

import {
  CommunityReaction,
  HotdealGuide,
  HotdealScore,
  ProductDetailImage,
} from '@features/product-detail/components';
import {
  CategoryPopularByProductSection,
  TogetherViewedSection,
} from '@features/products/sections';

import { CommentSection } from '../comment';
import CoupangPartnerGuide from '../CoupangPartnerGuide';

import ProductInfo from './ProductInfo';

export default async function DesktopProductDetailPage({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  return (
    <div
      className="grid grid-cols-2 gap-x-12 gap-y-10"
      style={{ gridTemplateRows: 'min-content 1fr' }}
    >
      <div className="col-span-1 space-y-10">
        <Suspense
          fallback={
            <div className="relative aspect-square rounded-xl border border-gray-200 bg-gray-50" />
          }
        >
          <div className="space-y-4">
            <div
              className="relative aspect-square overflow-hidden rounded-xl border border-gray-200"
              style={{ contain: 'layout paint', contentVisibility: 'auto' }}
            >
              <ProductDetailImage productId={productId} fill={false} />
            </div>
            <CoupangPartnerGuide productId={productId} />
          </div>
        </Suspense>

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
        <div className="h-[calc( sticky top-25">
          <Suspense fallback={<div className="h-[400px] opacity-0" />}>
            <ProductInfo productId={productId} isUserLogin={isUserLogin} />
          </Suspense>
        </div>
      </div>
      <div className="col-span-2 pt-5">
        <Hr />
        <div className="space-y-11 py-11">
          <div>
            <CommentSection productId={productId} isUserLogin={isUserLogin} isMobile={false} />
          </div>
          <Hr />
          <div>
            <TogetherViewedSection productId={productId} />
            <CategoryPopularByProductSection productId={productId} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Hr({ className }: { className?: string }) {
  return <div className={cn('h-[8px] bg-gray-100', className)} />;
}
