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
      <div className="flex gap-x-12">
        <Suspense
          fallback={
            <>
              <div className="relative aspect-square flex-1 basis-1/2 rounded-xl border border-gray-200 bg-gray-50" />
              <div className="flex flex-1 basis-1/2 pl-3 opacity-0" />
            </>
          }
        >
          <div
            className="relative aspect-square flex-1 basis-1/2 overflow-hidden rounded-xl border border-gray-200"
            style={{ contain: 'layout paint', contentVisibility: 'auto' }}
          >
            <ProductDetailImage productId={productId} fill={false} />
          </div>
          <ProductInfo productId={productId} isUserLogin={isUserLogin} />
        </Suspense>
      </div>
      <Hr className="mt-15 mb-[52px]" />
      <div className="flex gap-x-12">
        <div className="flex-1 basis-1/2">
          <Suspense fallback={<div className="h-[400px] opacity-0" />}>
            <HotdealGuide fixExpanded={true} productId={productId} />
          </Suspense>
        </div>
        <div className="flex-1 basis-1/2">
          <Suspense fallback={<div className="h-[400px] opacity-0" />}>
            <Suspense fallback={<div className="h-[400px] opacity-0" />}>
              <CommunityReaction productId={productId} />
            </Suspense>
            <Suspense fallback={<div className="h-[400px] opacity-0" />}>
              <HotdealScore productId={productId} />
            </Suspense>
          </Suspense>
        </div>
      </div>
      <Hr className="mt-21.5 mb-15" />
      <div className="flex flex-col gap-y-15">
        <CommentSection productId={productId} isUserLogin={isUserLogin} isMobile={false} />
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
