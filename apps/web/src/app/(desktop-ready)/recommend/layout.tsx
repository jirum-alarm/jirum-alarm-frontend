import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';
import BasicLayout from '@/components/layout/BasicLayout';
import SectionHeaderHOC from '@/components/SectionHeaderHOC';

import RecommendPageHeader from './components/RecommendPageHeader';

export default async function Layout({ children }: { children: ReactNode }) {
  const { isMobile } = await checkDevice();

  return (
    <>
      {isMobile ? (
        <BasicLayout header={<RecommendPageHeader />}>{children}</BasicLayout>
      ) : (
        <div className="mt-14 pt-8">
          <SectionHeaderHOC title="지름알림 추천" />
          <div className="mx-auto max-w-screen-layout-max">{children}</div>
        </div>
      )}
    </>
  );
}
