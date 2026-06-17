import { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { checkDevice } from '@/app/actions/agent';
import { getAccessToken } from '@/app/actions/token';

import { PAGE } from '@/shared/config/page';
import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';

import ProductCreateForm from '@/features/product-create/ui/ProductCreateForm';

export const metadata: Metadata = {
  title: '핫딜 등록 | 지름알림',
  // 로그인 필요 + 작성 페이지이므로 색인 제외
  robots: { index: false, follow: false },
};

export default async function ProductNewPage() {
  const token = await getAccessToken();
  // 로그인 후 등록 페이지로 복귀하도록 rtnUrl 부착 (로그인 뷰모델이 rtnUrl 쿼리를 읽어 복귀).
  if (!token) redirect(`${PAGE.LOGIN}?rtnUrl=${encodeURIComponent(PAGE.PRODUCT_NEW)}`);

  const { isMobile } = await checkDevice();

  if (isMobile) {
    return (
      <BasicLayout
        hasBackButton
        header={
          <header className="max-w-mobile-max fixed top-0 z-50 flex h-14 w-full items-center border-b border-gray-100 bg-white px-3">
            <BackButton />
            <span className="ml-1 text-base font-semibold text-gray-900">핫딜 등록</span>
          </header>
        }
      >
        <div className="px-5 pt-4">
          <ProductCreateForm />
        </div>
      </BasicLayout>
    );
  }

  return (
    <div className="max-w-layout-max mx-auto px-5 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <h1 className="mb-6 text-xl font-bold text-gray-900">핫딜 등록</h1>
        <ProductCreateForm />
      </div>
    </div>
  );
}
