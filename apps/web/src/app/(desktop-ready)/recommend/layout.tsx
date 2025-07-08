import { ReactNode } from 'react';

import BasicLayout from '@/components/layout/BasicLayout';
import DeviceSpecific from '@/components/layout/DeviceSpecific';
import SectionHeader from '@/components/SectionHeader';

import RecommendPageHeader from './components/RecommendPageHeader';

export default async function Layout({ children }: { children: ReactNode }) {
  return (
    <DeviceSpecific
      mobile={<BasicLayout header={<RecommendPageHeader />}>{children}</BasicLayout>}
      desktop={
        <div className="mt-14 pt-8">
          <SectionHeader title="지름알림 추천" />
          <div className="mx-auto max-w-screen-layout-max">{children}</div>
        </div>
      }
    />
  );
}
