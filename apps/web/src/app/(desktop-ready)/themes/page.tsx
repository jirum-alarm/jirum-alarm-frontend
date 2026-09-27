import { Metadata } from 'next';
import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';
import SectionHeader from '@/shared/ui/SectionHeader';

import ThemeList from '@/features/mypage/ui/theme/ThemeList';

export const metadata: Metadata = {
  title: '알림 묶음 | 지름알림',
  description: '관심 묶음을 구독하면 반응 좋은 딜만 골라 하루 최대 3건 알려드려요.',
  alternates: { canonical: '/themes' },
};

const ThemesPage = async () => {
  const { isMobile } = await checkDevice();

  // PC 는 큐레이션(curation/[id])과 같은 틀: SectionHeader 중앙 타이틀 + max-w-layout-max.
  if (!isMobile) {
    return (
      <div className="mt-14 pt-8">
        <h1 className="sr-only">알림 묶음</h1>
        <SectionHeader title="알림 묶음" />
        <p className="mb-8 text-center text-sm text-gray-500">
          관심 묶음을 구독하면 반응 좋은 딜만 골라 하루 최대 3건 알려드려요.
        </p>
        <div className="max-w-layout-max mx-auto px-5 pb-16">
          <Suspense>
            <ThemeList isMobile={false} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <BasicLayout hasBackButton title="알림 묶음">
      <div className="relative h-full px-5 py-6">
        <h1 className="sr-only">알림 묶음</h1>
        <p className="mb-5 text-sm text-gray-500">
          관심 묶음을 구독하면 반응 좋은 딜만 골라 하루 최대 3건 알려드려요.
        </p>
        <Suspense>
          <ThemeList isMobile />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default ThemesPage;
