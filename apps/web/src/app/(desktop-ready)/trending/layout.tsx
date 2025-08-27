import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';
import BasicLayout from '@/components/layout/BasicLayout';
import SectionHeader from '@/components/SectionHeader';

import TrendingPageHeader from './components/TrendingPageHeader';

export default async function Layout({ children }: { children: ReactNode }) {
  const { isMobile } = await checkDevice();

  const renderMobile = () => {
    return <BasicLayout header={<TrendingPageHeader />}>{children}</BasicLayout>;
  };
  const renderDesktop = () => {
    return (
      <div className="pt-22">
        <SectionHeader title="지름알림 랭킹" />
        <div className="max-w-layout-max mx-auto">{children}</div>
      </div>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
}
