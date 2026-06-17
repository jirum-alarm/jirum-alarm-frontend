import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

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

export default async function ProductWritePage() {
  const token = await getAccessToken();
  if (!token) redirect(PAGE.LOGIN);

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
        <Suspense>
          <ProductCreateForm />
        </Suspense>
      </BasicLayout>
    );
  }

  return (
    <div className="max-w-2xl py-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">핫딜 등록</h1>
      <Suspense>
        <ProductCreateForm />
      </Suspense>
    </div>
  );
}
