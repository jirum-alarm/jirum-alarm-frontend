import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import ThemeList from '@/features/mypage/ui/theme/ThemeList';

const ThemesPage = () => {
  return (
    <BasicLayout hasBackButton title="알림 묶음">
      <div className="relative h-full px-5 py-6">
        <p className="mb-4 text-sm text-gray-500">
          관심 묶음을 구독하면 그 안의 키워드 딜이 뜰 때 알림을 받아요.
        </p>
        <Suspense>
          <ThemeList />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default ThemesPage;
