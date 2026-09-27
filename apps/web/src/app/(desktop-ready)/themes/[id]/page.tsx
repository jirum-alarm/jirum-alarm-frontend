import { Metadata } from 'next';
import { Suspense } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BackButton from '@/shared/ui/layout/BackButton';
import BasicLayout from '@/shared/ui/layout/BasicLayout';
import PageHeader from '@/shared/ui/layout/PageHeader';
import ShareButton from '@/shared/ui/ShareButton';

import ThemeDetail from '@/features/mypage/ui/theme/ThemeDetail';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return {
    title: '알림 묶음 | 지름알림',
    description: '관심 묶음을 구독하면 반응 좋은 딜만 골라 하루 최대 3건 알려드려요.',
    alternates: { canonical: `/themes/${id}` },
  };
}

const ThemeDetailPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const themeId = Number(id);
  const { isMobile } = await checkDevice();

  // 큐레이션(curation/[id])과 같은 틀. PC: 넓은 컨테이너(타이틀은 ThemeDetail 의 SectionHeader).
  // 모바일: 뒤로가기 + 공유 헤더 — 공유 링크로 들어온 사람도 원탭 구독하게 하는 게 이 화면의 목적.
  if (!isMobile) {
    return (
      <div className="mt-14 pt-8">
        <div className="max-w-layout-max mx-auto px-5 pb-16">
          <Suspense>
            <ThemeDetail themeId={themeId} isMobile={false} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <BasicLayout
      header={
        <PageHeader
          leading={<BackButton backTo="/themes" />}
          title="알림 묶음"
          actions={<ShareButton title="알림 묶음 | 지름알림" />}
        />
      }
    >
      <div className="relative h-full px-5 py-6">
        <Suspense>
          <ThemeDetail themeId={themeId} isMobile />
        </Suspense>
      </div>
    </BasicLayout>
  );
};

export default ThemeDetailPage;
