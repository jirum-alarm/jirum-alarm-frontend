import { Suspense } from 'react';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import { AdvertiseSlotLocation, ProductInfoFragment, UploaderType } from '@/shared/api/gql/graphql';

import { type ProductData } from '@/entities/product/model/toss-data';
import ProductDetailImage from '@/entities/product/ui/ProductDetailImage';
import TossDetailImages from '@/entities/product/ui/TossDetailImages';

import { ProductDetailAd } from '@/features/adsense/ui/ProductDetailAd';
import FirstVisitAppAlertModal from '@/features/app-download/ui/FirstVisitAppAlertModal';
import { AdvertiseSlotBanner } from '@/features/banner';
import CommentSection from '@/features/product-comment/ui/CommentSection';
import { ExpiredProductWarning } from '@/features/product-detail/components';
import CoupangPartnerGuide from '@/features/product-detail/ui/CoupangPartnerGuide';
import KakaoOpenChatPrompt from '@/features/product-detail/ui/KakaoOpenChatPrompt';
import ViewerCount from '@/features/product-detail/ui/mobile/ViewerCount';
import NoticeProfitLink from '@/features/product-detail/ui/NoticeProfitUrl';
import PriceHistorySection from '@/features/product-detail/ui/PriceHistorySection';
import { CategoryPopularByProductSection, TogetherViewedSection } from '@/features/product-list/ui';

import CommunityReaction from '../CommunityReaction';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';

const TALKROOM_LINK = 'https://open.kakao.com/o/gJZTWAAg';

function ProductDetailPage({
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
            />
            <AdvertiseSlotBanner
              slotLocation={AdvertiseSlotLocation.ProductMainBanner}
              className="mx-5 mb-4 w-auto"
            />

            {/* 주 유입 경로가 핫딜 단톡방이라 상세에도 방으로 돌아가는 문을 둔다.
                광고가 팔리면 AdvertiseSlotBanner 와 세로로 겹치지만, 지금 이 슬롯은
                비어 있는 시간이 대부분이라 상품 정보 바로 아래 = 실제로 보이는 자리다. */}
            <KakaoOpenChatPrompt href={TALKROOM_LINK} className="mx-5 mb-4" />

            <CoupangPartnerGuide productId={productId} />

            {initialProduct && <ExpiredProductWarning product={initialProduct} isMobile={true} />}

            <div className="mt-4 mb-12 flex flex-col gap-y-9 px-5">
              <Suspense>
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
                <Suspense>
                  <CommunityReaction productId={productId} />
                </Suspense>
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
