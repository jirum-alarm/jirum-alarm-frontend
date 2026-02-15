import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@/shared/ui/layout/BottomNav';

import Footer from '@/widgets/layout/ui/desktop/Footer';
import TrendingPageHeader from '@/widgets/trending/ui/TrendingPageHeader';

export default async function Layout({ children }: { children: ReactNode }) {
  const { isMobile } = await checkDevice();

  const renderMobile = () => {
    return (
      <BasicLayout header={<TrendingPageHeader />} hasBottomNav navType={NAV_TYPE.TRENDING}>
        {children}
      </BasicLayout>
    );
  };
  const renderDesktop = () => {
    return (
      <div className="pt-22">
        <div className="max-w-layout-max mx-auto">{children}</div>
        <Footer />
      </div>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
}
