import { Suspense } from 'react';

import BasicLayout from '@/shared/ui/layout/BasicLayout';

import ThemeDetail from '@/features/mypage/ui/theme/ThemeDetail';

const ThemeDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const themeId = Number(id);

  return (
    <BasicLayout hasBackButton title="알림 묶음">
      <div className="relative h-full px-5 py-6">
        <Suspense>
          <ThemeDetail themeId={themeId} />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default ThemeDetailPage;
