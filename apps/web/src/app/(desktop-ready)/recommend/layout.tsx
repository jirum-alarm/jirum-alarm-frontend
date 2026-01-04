import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';
import SectionHeader from '@/shared/ui/SectionHeader';

import { RecommendPageHeader } from '@/widgets/recommend';

export default async function Layout({ children }: { children: ReactNode }) {
  const { isMobile } = await checkDevice();

  const renderMobile = () => {
    return <BasicLayout header={<RecommendPageHeader />}>{children}</BasicLayout>;
  };
  const renderDesktop = () => {
    return (
      <div className="mt-14 pt-8">
        <SectionHeader title="지름알림 추천" />
        <div className="max-w-layout-max mx-auto">{children}</div>
      </div>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
}
