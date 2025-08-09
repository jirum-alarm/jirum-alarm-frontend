import { Suspense } from 'react';

import SectionHeader from '@/components/SectionHeader';
import HorizontalProductListSkeleton from '@/features/products/components/skeleton/HorizontalProductListSkeleton';
import { cn } from '@/lib/cn';

import { CommentSection } from '../comment';
import CommunityReaction from '../CommunityReaction';
import ProductAdditionalInfoFetcher from '../fetcher/ProductAdditionalInfoFetcher';
import ProductGuidesFetcher from '../fetcher/ProductGuidesFetcher';
import ProductInfoFetcher from '../fetcher/ProductInfoFetcher';
import HotdealGuide from '../HotdealGuide';
import HotdealScore from '../HotdealScore';
import PopularProductsContainer from '../PopularProudctsContainer';
import ProductDetailImage from '../ProductDetailImage';
import RelatedProductsContainer from '../RelatedProductsContainer';

import ProductInfo from './ProductInfo';

export default async function DesktopProductDetailLayout({
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
          <ProductInfoFetcher productId={productId}>
            <div
              className="relative aspect-square flex-1 basis-1/2 overflow-hidden rounded-[20px] border border-gray-200"
              style={{ contain: 'layout paint', contentVisibility: 'auto' }}
            >
              <ProductDetailImage productId={productId} />
            </div>
            <ProductInfo productId={productId} isUserLogin={isUserLogin} />
          </ProductInfoFetcher>
        </Suspense>
      </div>
      <Hr className="mb-[52px] mt-[60px]" />
      <div className="flex gap-x-6">
        <div className="flex-1 basis-1/2 pr-3">
          <Suspense fallback={<div className="h-[400px] opacity-0" />}>
            <ProductGuidesFetcher productId={productId}>
              <HotdealGuide fixExpanded={true} productId={productId} />
            </ProductGuidesFetcher>
          </Suspense>
        </div>
        <div className="flex-1 basis-1/2 pl-3">
          <Suspense fallback={<div className="h-[400px] opacity-0" />}>
            <ProductAdditionalInfoFetcher productId={productId}>
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <CommunityReaction productId={productId} />
              </Suspense>
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <HotdealScore productId={productId} />
              </Suspense>
            </ProductAdditionalInfoFetcher>
          </Suspense>
        </div>
      </div>
      <Hr className="mb-[60px] mt-[86px]" />
      <div className="flex flex-col gap-y-[60px]">
        <CommentSection productId={productId} />
        <Hr />
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
    </div>
  );
}

function Hr({ className }: { className?: string }) {
  return <div className={cn('h-[8px] bg-gray-100', className)} />;
}
