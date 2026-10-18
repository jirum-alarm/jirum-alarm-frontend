import { type ReactNode, Suspense } from 'react';

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
import {
  CategoryLatestLinksSection,
  CategoryPopularByProductSection,
  TossInternalLinksSection,
} from '@/features/product-list/ui';

import CommunityReaction from '../CommunityReaction';
import FirstVisitAlertSheet from '../FirstVisitAlertSheet';

import BottomCTA from './BottomCTA';
import ProductInfo from './ProductInfo';

function ProductDetailPage({
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

      {/* google-anno-skip: desktop ProductDetailPage 와 같은 이유 — UI 글자에 광고 인텐트 링크·칩이 끼지 않게. */}
      <main className="google-anno-skip">
        <div className="sticky top-0 -mb-6">
          <div className="relative aspect-square w-full">
            {initialProduct ? <ProductDetailImage product={initialProduct} fill /> : null}
            <ViewerCount productId={productId} />
          </div>
        </div>
        <div className="relative z-10 w-full rounded-t-3xl border-t border-gray-100 bg-white pt-6">
          {/* ① 요약 — 상품명·가격·근거·구매 정보. 첫 화면에서 판단에 필요한 것만. */}
          <ProductInfo
            productId={productId}
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
            className="mx-5 mb-6"
          />

          {/* 요약 아래 안내 묶음 — 광고 배너·카톡방·쿠팡 고지. 비오카방 유입만 카톡방 soft 안내
              (오카방 UTM·이미 입장한 유저는 SoftKakao 가 숨김). 광고 슬롯이 비어 있는 시간이 대부분이라
              상품 정보 바로 아래 = 보이는 자리. */}
          <div className="flex flex-col gap-3 px-5 pb-8 empty:hidden">
            <AdvertiseSlotBanner slotLocation={AdvertiseSlotLocation.ProductMainBanner} />
            <SoftKakaoOpenChatPrompt
              categoryId={initialProduct?.categoryId}
              productId={productId}
            />
            <CoupangPartnerGuide productId={productId} />
          </div>

          {/* ② 비교 — 막 올라온 딜(7일 미만)엔 같은 상품·같은 라인의 다른 진행 중 딜, 오래된 딜엔 최신 핫딜. */}
          {initialProduct && (
            <DetailSection className="flex flex-col gap-8">
              <ExpiredProductWarning product={initialProduct} isMobile={true} />
              <LiveAlternativeDeals product={initialProduct} className="px-5" />
            </DetailSection>
          )}

          {/* ③ 가격 추이 */}
          {!hidePrice && (
            <DetailSection className="px-5">
              <Suspense>
                <PriceHistorySection
                  productId={productId}
                  source="detail_mobile"
                  currentPrice={
                    initialProduct?.price
                      ? Number(String(initialProduct.price).replace(/[^0-9.]/g, ''))
                      : null
                  }
                  postedAt={initialProduct?.postedAt}
                />
              </Suspense>
            </DetailSection>
          )}

          {/* ④ 커뮤니티 반응 — 유저 직접 등록 상품은 크롤링 출처가 없으므로 숨김.
              ProductPrefetch 가 서버에서 데이터를 다 받아두므로 Suspense 로 감싸지 않는다.
              감싸면 React 가 별도 스트리밍 단위로 떼어내 첫 페인트에 "없다가 생긴다". */}
          {initialProduct?.uploaderType !== UploaderType.User && (
            <DetailSection className="px-5">
              <CommunityReaction productId={productId} />
            </DetailSection>
          )}

          {/* ⑤ 관련 딜 — 광고·댓글·토스 이미지보다 위. 맨 아래에 두었을 땐 네이버 검색 유입(모바일 최대)의
              74% 가 거기까지 내려가지 않아 클릭이 사실상 0이었다(2026-10-08 GA4). */}
          <DetailSection className="flex flex-col gap-4 pt-4">
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
          </DetailSection>

          {/* 광고 자리(상세 본문 = 애드센스 수익 대부분)는 관련 딜 바로 아래 그대로. */}
          <div className="pb-8">
            <ProductDetailAd productId={productId} isMobile />
          </div>

          {/* ⑥ 상세 이미지(토스) · 댓글 */}
          {tossData?.images && (
            <DetailSection>
              <TossDetailImages images={tossData.images} />
            </DetailSection>
          )}
          <DetailSection>
            <CommentSection productId={productId} isUserLogin={isUserLogin} isMobile={true} />
          </DetailSection>

          <NoticeProfitLink productId={productId} />

          <div className="h-16 bg-gray-100" />
          <BottomCTA productId={productId} isUserLogin={isUserLogin} />
        </div>
      </main>
    </>
  );
}
export default ProductDetailPage;

/**
 * 상세 본문의 큰 묶음 하나 — 위에 8px 회색 띠, 위아래 32px. 묶음 사이 간격을 자리마다 따로 적지 않는다
 * (예전엔 mb-4·mb-6·mb-8·mb-12·gap-9 가 섞여 섹션 경계가 흐렸다). 안이 비면(조건부 블록이 모두 null) 띠째 숨는다.
 */
function DetailSection({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn('border-t-8 border-gray-100 py-8 empty:hidden', className)}>{children}</div>
  );
}
