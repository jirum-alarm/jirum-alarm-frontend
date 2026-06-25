import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import ThemeList from '@/features/mypage/ui/theme/ThemeList';

const ThemesPage = async () => {
  const { isMobile } = await checkDevice();

  const content = (
    <>
      <h1 className={isMobile ? 'sr-only' : 'mb-1 text-2xl font-bold text-gray-900'}>알림 묶음</h1>
      <p className="mb-5 text-sm text-gray-500">
        관심 묶음을 구독하면 그 안의 키워드 딜이 뜰 때 알림을 받아요.
      </p>
      <Suspense>
        <ThemeList isMobile={isMobile} />
      </Suspense>
    </>
  );

  if (!isMobile) {
    return <div className="max-w-layout-max mx-auto px-5 py-12">{content}</div>;
  }

  return (
    <BasicLayout hasBackButton title="알림 묶음">
      <div className="relative h-full px-5 py-6">{content}</div>
    </BasicLayout>
  );
};

export default ThemesPage;
