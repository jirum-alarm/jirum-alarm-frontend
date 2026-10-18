import { Suspense } from 'react';

import { CheckDeviceResult } from '@/app/actions/agent.types';

import { AdvertiseSlotLocation, ProductInfoFragment, UploaderType } from '@/shared/api/gql/graphql';
import type {
  ProductDealEvidence,
  ProductModelPageLink,
} from '@/shared/api/product/product.service';
import { cn } from '@/shared/lib/cn';

import { type ProductData } from '@/entities/product/model/toss-data';
import ProductDetailImage from '@/entities/product/ui/ProductDetailImage';
import TossDetailImages from '@/entities/product/ui/TossDetailImages';

import { ProductDetailAd } from '@/features/adsense/ui/ProductDetailAd';
import { AdvertiseSlotBanner } from '@/features/banner';
import CommentSection from '@/features/product-comment/ui/CommentSection';
import { ExpiredProductWarning, LiveAlternativeDeals } from '@/features/product-detail/components';
import CoupangPartnerGuide from '@/features/product-detail/ui/CoupangPartnerGuide';
import NoticeProfitLink from '@/features/product-detail/ui/NoticeProfitUrl';
import PriceHistorySection from '@/features/product-detail/ui/PriceHistorySection';
import type { GuideRow as ProductGuideRow } from '@/features/product-detail/ui/ProductGuideMetaRows';
import ProductPriceContext from '@/features/product-detail/ui/ProductPriceContext';
import SoftKakaoOpenChatPrompt from '@/features/product-detail/ui/SoftKakaoOpenChatPrompt';
import ViewerCount from '@/features/product-detail/ui/ViewerCount';
import WaitCard from '@/features/product-detail/ui/WaitCard';
import {
  CategoryLatestLinksSection,
  CategoryPopularByProductSection,
  TossInternalLinksSection,
} from '@/features/product-list/ui';

import CommunityReaction from '../CommunityReaction';
import FirstVisitAlertSheet from '../FirstVisitAlertSheet';

import ProductInfo from './ProductInfo';

export default async function DesktopProductDetailPage({
  productId,
  isUserLogin,
  initialProduct,
  device,
  initialGuides,
  initialEvidence,
  hidePrice,
  modelPage,
  ageNotice,
}: {
  productId: number;
  isUserLogin: boolean;
  initialProduct?: ProductInfoFragment;
  device?: CheckDeviceResult;
  initialGuides?: ProductGuideRow[] | null;
  initialEvidence?: ProductDealEvidence | null;
  hidePrice?: boolean;
  modelPage?: ProductModelPageLink | null;
  ageNotice?: string | null;
}) {
  // 백엔드 product.data.toss (수집 배치가 채움). 없으면 토스 블록 미노출.
  const tossData = (initialProduct?.data as ProductData | undefined)?.toss;
  const naverbcData = (initialProduct?.data as ProductData | undefined)?.naverbc;
  const ohouData = (initialProduct?.data as ProductData | undefined)?.ohou;

  return (
    <>
      {device && (
        <FirstVisitAlertSheet
          device={device}
          title={initialProduct?.title}
          productId={initialProduct?.id}
          categoryId={initialProduct?.categoryId}
        />
      )}
      {/* google-anno-skip: 애드센스 '광고 인텐트'가 UI 글자("가격 추이"의 "가격" 등)를 광고 링크로 바꾸고
          부제 사이에 검색어 칩("제조 공장 견적받기")을 끼웠다. 구글 문서의 제외 클래스 — 하단 앵커 광고는 그대로다. */}
      <div className="max-w-layout-max google-anno-skip mx-auto grid grid-cols-12 gap-x-6">
        <div
          className="col-span-10 col-start-2 grid grid-cols-2 gap-x-12 gap-y-10"
          style={{ gridTemplateRows: 'min-content 1fr' }}
        >
          <div className="col-span-1 flex flex-col gap-12">
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square overflow-hidden rounded-xl border border-gray-200">
                {initialProduct ? (
                  <ProductDetailImage product={initialProduct} fill={false} />
                ) : null}
                {/* 모바일과 같은 이미지 위 알약 — 오른쪽 가격 칸 한가운데 띠로 두면 가격 판단과 구매 정보를 갈라놓았다. */}
                <ViewerCount productId={productId} />
              </div>
              <AdvertiseSlotBanner
                slotLocation={AdvertiseSlotLocation.ProductMainBanner}
                priority
              />
              {/* 비오카방 유입만 soft 안내. 헤더/푸터 아이콘만으로는 방 존재가 안 전달된다. */}
              <SoftKakaoOpenChatPrompt
                categoryId={initialProduct?.categoryId}
                productId={productId}
              />
              <CoupangPartnerGuide productId={productId} />
            </div>

            {/* 비교 → 가격 추이 → 커뮤니티 반응. 간격은 이 묶음의 gap 하나로만 준다(각 블록은 바깥 여백이 없다). */}
            {initialProduct && <ExpiredProductWarning product={initialProduct} isMobile={false} />}
            {initialProduct && <LiveAlternativeDeals product={initialProduct} />}
            {!hidePrice && (
              <Suspense fallback={null}>
                <PriceHistorySection
                  productId={productId}
                  source="detail_desktop"
                  currentPrice={
                    initialProduct?.price
                      ? Number(String(initialProduct.price).replace(/[^0-9.]/g, ''))
                      : null
                  }
                  postedAt={initialProduct?.postedAt}
                />
              </Suspense>
            )}
            {/* 유저 직접 등록 상품은 크롤링 출처(커뮤니티 반응)가 없으므로 숨김.
                ProductPrefetch 가 서버에서 데이터를 다 받아두므로 Suspense 로 감싸지 않는다.
                감싸면 React 가 별도 스트리밍 단위로 떼어내 첫 페인트에 "없다가 생긴다". */}
            {initialProduct?.uploaderType !== UploaderType.User && (
              <CommunityReaction productId={productId} />
            )}
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
                initialEvidence={initialEvidence}
                hidePrice={hidePrice}
              />
              {/* 서버 렌더 — 가격대·모델 페이지 링크. ProductInfo(클라이언트) 바로 아래. */}
              <ProductPriceContext
                ageNotice={hidePrice ? null : ageNotice}
                modelPage={hidePrice ? null : modelPage}
                productTitle={initialProduct?.title}
                showHelpLink={!hidePrice}
              />
              {/* «언제 사나» 카드(A/B wait_card_detail_v1, 11/5~) — 가격 블록 아래·근거 칸 밖. 서버가 null 이면 자리도 없다. */}
              {!hidePrice && (
                <WaitCard
                  productId={productId}
                  source="detail_desktop"
                  answerKind={initialEvidence?.headline?.kind}
                />
              )}
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
                {/* 토스 상품끼리 잇는 내부 링크(실험 toss_internal_link_v1) — 네이버가 토스 상세를 더 긁게. */}
                {tossData && (
                  <Suspense>
                    <TossInternalLinksSection productId={productId} />
                  </Suspense>
                )}
                <Suspense>
                  <CategoryPopularByProductSection productId={productId} />
                </Suspense>
                <Suspense>
                  <CategoryLatestLinksSection
                    productId={productId}
                    categoryId={initialProduct?.categoryId ?? null}
                    categoryName={initialProduct?.categoryName}
                  />
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
  return <div className={cn('h-2 bg-gray-100', className)} />;
}
