import { Suspense } from 'react';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import { AdvertiseSlotLocation, ProductInfoFragment, UploaderType } from '@/shared/api/gql/graphql';
import { cn } from '@/shared/lib/cn';

import { type ProductData } from '@/entities/product/model/toss-data';
import ProductDetailImage from '@/entities/product/ui/ProductDetailImage';
import TossDetailImages from '@/entities/product/ui/TossDetailImages';

import { ProductDetailAd } from '@/features/adsense/ui/ProductDetailAd';
import FirstVisitAppAlertModal from '@/features/app-download/ui/FirstVisitAppAlertModal';
import { AdvertiseSlotBanner } from '@/features/banner';
import CommentSection from '@/features/product-comment/ui/CommentSection';
import { ExpiredProductWarning } from '@/features/product-detail/components';
import CoupangPartnerGuide from '@/features/product-detail/ui/CoupangPartnerGuide';
import NoticeProfitLink from '@/features/product-detail/ui/NoticeProfitUrl';
import PriceHistorySection from '@/features/product-detail/ui/PriceHistorySection';
import { CategoryPopularByProductSection, TogetherViewedSection } from '@/features/product-list/ui';

import CommunityReaction from '../CommunityReaction';

import ProductInfo from './ProductInfo';

export default async function DesktopProductDetailPage({
  productId,
  isUserLogin,
  initialProduct,
  device,
}: {
  productId: number;
  isUserLogin: boolean;
  initialProduct?: ProductInfoFragment;
  device?: CheckDeviceResult;
}) {
  // 백엔드 product.data.toss (수집 배치가 채움). 없으면 토스 블록 미노출.
  const tossData = (initialProduct?.data as ProductData | undefined)?.toss;
  const naverbcData = (initialProduct?.data as ProductData | undefined)?.naverbc;
  const ohouData = (initialProduct?.data as ProductData | undefined)?.ohou;

  return (
    <>
      {device && <FirstVisitAppAlertModal device={device} />}
      <div className="max-w-layout-max mx-auto grid grid-cols-12 gap-x-6">
        <div
          className="col-span-10 col-start-2 grid grid-cols-2 gap-x-12 gap-y-10"
          style={{ gridTemplateRows: 'min-content 1fr' }}
        >
          <div className="col-span-1 space-y-10">
            <div className="space-y-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200">
                {initialProduct ? (
                  <ProductDetailImage product={initialProduct} fill={false} />
                ) : null}
              </div>
              <AdvertiseSlotBanner
                slotLocation={AdvertiseSlotLocation.ProductMainBanner}
                priority
              />
              <CoupangPartnerGuide productId={productId} />
            </div>

            {initialProduct && <ExpiredProductWarning product={initialProduct} isMobile={false} />}

            <div className="space-y-12">
              <Suspense fallback={null}>
                <PriceHistorySection
                  productId={productId}
                  currentPrice={
                    initialProduct?.price
                      ? Number(String(initialProduct.price).replace(/[^0-9.]/g, ''))
                      : null
                  }
                  postedAt={initialProduct?.postedAt}
                />
              </Suspense>
              {/* 유저 직접 등록 상품은 크롤링 출처(커뮤니티 반응)가 없으므로 숨김 */}
              {initialProduct?.uploaderType !== UploaderType.User && (
                <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                  <CommunityReaction productId={productId} />
                </Suspense>
              )}
            </div>
          </div>

          <div className="col-span-1">
            <div className="sticky top-25 space-y-6">
              <Suspense fallback={<div className="h-[400px] opacity-0" />}>
                <ProductInfo
                  productId={productId}
                  isUserLogin={isUserLogin}
                  tossData={tossData}
                  naverbcData={naverbcData}
                  ohouData={ohouData}
                />
              </Suspense>
            </div>
          </div>
          <div className="col-span-2 pt-5">
            <Hr />
            <div className="space-y-11 overflow-x-hidden py-11">
              <ProductDetailAd productId={productId} isMobile={false} />
              {tossData?.images && <TossDetailImages images={tossData.images} />}
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
