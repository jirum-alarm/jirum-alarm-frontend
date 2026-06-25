import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import ThemeDetail from '@/features/mypage/ui/theme/ThemeDetail';

const ThemeDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const themeId = Number(id);
  const { isMobile } = await checkDevice();

  // PC: BasicLayout(모바일 헤더) 없이 넓은 컨테이너. 모바일: 기존 BasicLayout + 뒤로가기.
  if (!isMobile) {
    return (
      <div className="max-w-layout-max mx-auto px-5 py-12">
        <Suspense>
          <ThemeDetail themeId={themeId} isMobile={false} />
        </Suspense>
      </div>
    );
  }

  return (
    <BasicLayout hasBackButton title="알림 묶음">
      <div className="relative h-full px-5 py-6">
        <Suspense>
          <ThemeDetail themeId={themeId} isMobile />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default ThemeDetailPage;
