import { Metadata } from 'next';
import { Suspense } from 'react';

import { LoadingSpinner } from '@/components/common/icons';
import BasicLayout from '@/components/layout/BasicLayout';
import { NAV_TYPE } from '@/components/layout/BottomNav';
import TopButton from '@/components/TopButton';

import TrendingContainerServer from './components/trending-container/server';
import TrendingPageHeader from './components/TrendingPageHeader';
import { TAB_META } from './tabMeta';

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ tab: string }>;
}): Promise<Metadata> {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;
  const meta = TAB_META[tabNumber] || TAB_META[0];
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: `https://jirum-alarm.com/trending?tab=${tabNumber}`,
      images: ['/assets/images/opengraph-image.png'],
      type: 'website',
      siteName: '지름알림',
    },
  };
}

const TrendingPage = async ({ searchParams }: { searchParams: Promise<{ tab: string }> }) => {
  const { tab } = await searchParams;
  const tabNumber = tab ? Number(tab) : 0;
  // checkJirumAlarmApp는 서버에서만 사용되므로, TrendingPage를 async로 유지할 필요 없음
  // const { isJirumAlarmApp } = await checkJirumAlarmApp();
  // TopButton의 hasBottomNav prop은 true로 고정하거나, 별도 처리 필요
  // SSR에서만 필요한 경우 별도 처리 가능
  return (
    <BasicLayout hasBottomNav navType={NAV_TYPE.TRENDING} header={<TrendingPageHeader />}>
      <div className="h-full">
        <Suspense
          fallback={
            <div className="-mt-10 flex h-full w-full items-center justify-center">
              <LoadingSpinner width={50} height={50} />
            </div>
          }
        >
          <TrendingContainerServer tab={tabNumber} />
        </Suspense>
      </div>
      <TopButton />
    </BasicLayout>
  );
};

export default TrendingPage;
