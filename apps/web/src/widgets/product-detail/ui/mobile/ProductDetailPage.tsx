import { Suspense } from 'react';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import { AdvertiseSlotLocation, ProductInfoFragment, UploaderType } from '@/shared/api/gql/graphql';
import type { ProductModelPageLink } from '@/shared/api/product/product.service';

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
import ViewerCount from '@/features/product-detail/ui/mobile/ViewerCount';
import NoticeProfitLink from '@/features/product-detail/ui/NoticeProfitUrl';
import PriceHistorySection from '@/features/product-detail/ui/PriceHistorySection';
import type { GuideRow as ProductGuideRow } from '@/features/product-detail/ui/ProductGuideMetaRows';
import ProductPriceContext from '@/features/product-detail/ui/ProductPriceContext';
import SoftKakaoOpenChatPrompt from '@/features/product-detail/ui/SoftKakaoOpenChatPrompt';
import { CategoryPopularByProductSection, TogetherViewedSection } from '@/features/product-list/ui';

import CommunityReaction from '../CommunityReaction';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';

function ProductDetailPage({
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
      <ViewerCount productId={productId} />

      <main>
        <div className="sticky top-0 -mb-6">
          <div className="relative aspect-square w-full">
            {initialProduct ? <ProductDetailImage product={initialProduct} fill /> : null}
          </div>
        </div>
        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          <div className="flex flex-col">
            <ProductInfo
              productId={productId}
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
              className="mx-5 mb-6"
            />
            <AdvertiseSlotBanner
              slotLocation={AdvertiseSlotLocation.ProductMainBanner}
              className="mx-5 mb-4 w-auto"
            />

            {/* 비오카방 유입만 soft 안내. 오카방 UTM·이미 입장한 유저는 SoftKakao 가 숨김.
                광고 슬롯이 비어 있는 시간이 대부분이라 상품 정보 바로 아래 = 보이는 자리. */}
            <SoftKakaoOpenChatPrompt className="mx-5 mb-4" />

            <CoupangPartnerGuide productId={productId} />

            {initialProduct && <ExpiredProductWarning product={initialProduct} isMobile={true} />}

            <div className="mt-4 mb-12 flex flex-col gap-y-9 px-5">
              <Suspense>
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

            <ProductDetailAd productId={productId} isMobile />
            <Hr />
            {tossData?.images && <TossDetailImages images={tossData.images} />}
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
