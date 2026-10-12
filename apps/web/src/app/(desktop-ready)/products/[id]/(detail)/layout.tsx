import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import { resolveAppDownloadPlatform } from '@/features/app-download/model/resolvePlatform';
import OpenInAppLink from '@/features/app-download/ui/OpenInAppLink';
import ProductDetailPageHeader from '@/features/product-detail/ui/ProductDeatilPageHeader';

import Footer from '@/widgets/layout/ui/desktop/Footer';

const ProductDetailLayout = async ({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) => {
  const { id } = await params;

  const device = await checkDevice();

  // 「앱으로 보기」 — 상세 유입의 대부분이 검색·공유로 바로 들어온 모바일 웹이다. 앱이 있으면 이 상품이 앱에서
  // 바로 열리고, 없으면 출처를 실어 스토어로 간다(features/app-download/model/appHandoff.ts). 첫 방문 시트와 달리
  // 늘 같은 자리의 작은 버튼 — 화면을 가리는 권유(전면 팝업)는 검색 품질 감점 대상이다.
  // 서버 UA 판정이라 첫 페인트부터 자리가 잡힌다(나중에 끼어들며 헤더를 밀지 않는다).
  // 360px(갤럭시 기본 폭)에서 로고 부제와 안 겹치게 짧은 문구·좁은 여백(-mr-2 = 검색 아이콘 터치 여백만큼),
  // 그보다 좁으면 숨긴다 — 실측 360px 에서 「앱으로 보기」·px-3 은 부제를 12px 덮었다.
  const appPlatform = device.isJirumAlarmApp ? null : resolveAppDownloadPlatform(device);
  const openInApp =
    appPlatform === 'apple' || appPlatform === 'android' ? (
      <OpenInAppLink
        platform={appPlatform}
        path={`/products/${id}`}
        source="detail_header"
        iosUniversalLink
        className="bg-primary-500 text-fixed-900 -mr-2 flex h-7 items-center rounded-full px-2 text-xs font-semibold whitespace-nowrap max-[359px]:hidden"
      >
        앱 열기
      </OpenInAppLink>
    ) : null;

  const renderMobile = () => {
    return (
      <BasicLayout header={<ProductDetailPageHeader productId={+id} openInApp={openInApp} />}>
        {children}
      </BasicLayout>
    );
  };
  const renderDesktop = () => {
    return (
      <>
        <div className="mt-14 pt-11">{children}</div>
        <Footer />
      </>
    );
  };

  return device.isMobile ? renderMobile() : renderDesktop();
};

export default ProductDetailLayout;
