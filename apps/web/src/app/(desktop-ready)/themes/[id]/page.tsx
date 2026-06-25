import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import ThemeDetail from '@/features/mypage/ui/theme/ThemeDetail';

const ThemeDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const themeId = Number(id);
  const { isMobile } = await checkDevice();

  return (
    <BasicLayout hasBackButton title="알림 묶음">
      <div className="pc:mx-auto pc:max-w-layout-max pc:py-10 relative h-full px-5 py-6">
        <Suspense>
          <ThemeDetail themeId={themeId} isMobile={isMobile} />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default ThemeDetailPage;
