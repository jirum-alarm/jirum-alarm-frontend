import { Suspense } from 'react';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import { AdvertiseSlotLocation, ProductInfoFragment, UploaderType } from '@/shared/api/gql/graphql';
import type { ProductModelPageLink } from '@/shared/api/product/product.service';
import { cn } from '@/shared/lib/cn';

import { type ProductData } from '@/entities/product/model/toss-data';
import ProductDetailImage from '@/entities/product/ui/ProductDetailImage';
import TossDetailImages from '@/entities/product/ui/TossDetailImages';

import { ProductDetailAd } from '@/features/adsense/ui/ProductDetailAd';
import FirstVisitAppAlertModal from '@/features/app-download/ui/FirstVisitAppAlertModal';
import { AdvertiseSlotBanner } from '@/features/banner';
import CommentSection from '@/features/product-comment/ui/CommentSection';
import { ExpiredProductWarning } from '@/features/product-detail/components';
import type { ProductPriceVerdict } from '@/features/product-detail/lib/price-verdict';
import CoupangPartnerGuide from '@/features/product-detail/ui/CoupangPartnerGuide';
import NoticeProfitLink from '@/features/product-detail/ui/NoticeProfitUrl';
import PriceHistorySection from '@/features/product-detail/ui/PriceHistorySection';
import type { GuideRow as ProductGuideRow } from '@/features/product-detail/ui/ProductGuideMetaRows';
import ProductPriceContext from '@/features/product-detail/ui/ProductPriceContext';
import SoftKakaoOpenChatPrompt from '@/features/product-detail/ui/SoftKakaoOpenChatPrompt';
import { CategoryPopularByProductSection, TogetherViewedSection } from '@/features/product-list/ui';

import CommunityReaction from '../CommunityReaction';

import ProductInfo from './ProductInfo';

export default async function DesktopProductDetailPage({
  productId,
  isUserLogin,
  initialProduct,
  device,
  initialGuides,
  initialVerdict,
  hidePrice,
  priceRangeText,
  modelPage,
  ageNotice,
}: {
  productId: number;
  isUserLogin: boolean;
  initialProduct?: ProductInfoFragment;
  device?: CheckDeviceResult;
  initialGuides?: ProductGuideRow[] | null;
  initialVerdict?: ProductPriceVerdict | null;
  hidePrice?: boolean;
  priceRangeText?: string | null;
  modelPage?: ProductModelPageLink | null;
  ageNotice?: string | null;
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
              {/* 비오카방 유입만 soft 안내. 헤더/푸터 아이콘만으로는 방 존재가 안 전달된다. */}
              <SoftKakaoOpenChatPrompt />
              <CoupangPartnerGuide productId={productId} />
            </div>

            {initialProduct && <ExpiredProductWarning product={initialProduct} isMobile={false} />}

            <div className="space-y-12">
              <Suspense fallback={null}>
                {!hidePrice && (
                  <PriceHistorySection
                    productId={productId}
                    currentPrice={
                      initialProduct?.price
                        ? Number(String(initialProduct.price).replace(/[^0-9.]/g, ''))
                        : null
                    }
                    postedAt={initialProduct?.postedAt}
                  />
                )}
              </Suspense>
              {/* 유저 직접 등록 상품은 크롤링 출처(커뮤니티 반응)가 없으므로 숨김.
                  ProductPrefetch 가 서버에서 데이터를 다 받아두므로 Suspense 로 감싸지 않는다.
                  감싸면 React 가 별도 스트리밍 단위로 떼어내 첫 페인트에 "없다가 생긴다". */}
              {initialProduct?.uploaderType !== UploaderType.User && (
                <CommunityReaction productId={productId} />
              )}
            </div>
          </div>

          <div className="col-span-1">
            <div className="sticky top-25 space-y-6">
              {/* 상품명·가격·가이드 = 첫 화면 핵심. 데이터가 전부 프리페치돼 있어
                  Suspense 로 떼어내면 우측 컬럼이 통째로 늦게 그려진다. */}
              <ProductInfo
                productId={productId}
                isUserLogin={isUserLogin}
                tossData={tossData}
                naverbcData={naverbcData}
                ohouData={ohouData}
                initialGuides={initialGuides}
                initialVerdict={initialVerdict}
                hidePrice={hidePrice}
              />
              {/* 서버 렌더 — 가격대·모델 페이지 링크. ProductInfo(클라이언트) 바로 아래. */}
              <ProductPriceContext
                priceRangeText={hidePrice ? null : priceRangeText}
                ageNotice={hidePrice ? null : ageNotice}
                modelPage={hidePrice ? null : modelPage}
              />
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
