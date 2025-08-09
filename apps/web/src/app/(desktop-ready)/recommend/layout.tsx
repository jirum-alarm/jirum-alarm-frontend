import { ReactNode } from 'react';

import BasicLayout from '@/components/layout/BasicLayout';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import SectionHeader from '@/components/SectionHeader';

import RecommendPageHeader from './components/RecommendPageHeader';

export default async function Layout({ children }: { children: ReactNode }) {
  const renderMobile = () => {
    return <BasicLayout header={<RecommendPageHeader />}>{children}</BasicLayout>;
  };
  const renderDesktop = () => {
    return (
      <div className="mt-14 pt-8">
        <SectionHeader title="지름알림 추천" />
        <div className="mx-auto max-w-screen-layout-max">{children}</div>
      </div>
    );
  };

  return <DeviceSpecific mobile={renderMobile} desktop={renderDesktop} />;
}
