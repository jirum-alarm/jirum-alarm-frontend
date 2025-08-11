import { Suspense } from 'react';

import { cn } from '@/lib/cn';

import {
  CommunityReaction,
  HotdealGuide,
  HotdealScore,
  ProductDetailImage,
} from '@features/product-detail/components';
import {
  ProductAdditionalInfoPrefetch,
  ProductInfoPrefetch,
  ProductStatsPrefetch,
} from '@features/product-detail/prefetch';
import {
  CategoryPopularByProductSection,
  TogetherViewedSection,
} from '@features/products/sections';

import { CommentSection } from '../comment';

import ProductInfo from './ProductInfo';

export default async function DesktopProductDetailPage({
  productId,
  isUserLogin,
}: {
  productId: number;
  isUserLogin: boolean;
}) {
  return (
    <div className="mb-[68px] flex flex-col items-stretch">
      <div className="flex gap-x-6">
        <Suspense
          fallback={
            <>
              <div className="relative aspect-square flex-1 basis-1/2 rounded-[20px] border border-gray-200 bg-gray-50" />
              <div className="flex flex-1 basis-1/2 pl-3 opacity-0" />
            </>
          }
        >
          <ProductInfoPrefetch productId={productId}>
            <div
              className="relative aspect-square flex-1 basis-1/2 overflow-hidden rounded-[20px] border border-gray-200"
              style={{ contain: 'layout paint', contentVisibility: 'auto' }}
            >
              <ProductDetailImage productId={productId} fill={false} />
            </div>
            <ProductInfo productId={productId} isUserLogin={isUserLogin} />
          </ProductInfoPrefetch>
        </Suspense>
      </div>
      <Hr className="mb-[52px] mt-[60px]" />
      <div className="flex gap-x-6">
        <div className="flex-1 basis-1/2 pr-3">
          <Suspense fallback={<div className="h-[400px] opacity-0" />}>
            <ProductAdditionalInfoPrefetch productId={productId}>
              <HotdealGuide fixExpanded={true} productId={productId} />
            </ProductAdditionalInfoPrefetch>
          </Suspense>
        </div>
        <div className="flex-1 basis-1/2 pl-3">
          <Suspense fallback={<div className="h-[400px] opacity-0" />}>
            <ProductStatsPrefetch productId={productId}>
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <CommunityReaction productId={productId} />
              </Suspense>
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <HotdealScore productId={productId} />
              </Suspense>
            </ProductStatsPrefetch>
          </Suspense>
        </div>
      </div>
      <Hr className="mb-[60px] mt-[86px]" />
      <div className="flex flex-col gap-y-[60px]">
        <CommentSection productId={productId} />
        <Hr />
        <TogetherViewedSection productId={productId} />
        <CategoryPopularByProductSection productId={productId} />
      </div>
    </div>
  );
}

function Hr({ className }: { className?: string }) {
  return <div className={cn('h-[8px] bg-gray-100', className)} />;
}
