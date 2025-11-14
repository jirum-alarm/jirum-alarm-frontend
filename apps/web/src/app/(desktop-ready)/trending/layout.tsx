import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';
import BasicLayout from '@/components/layout/BasicLayout';

import Footer from '../components/desktop/Footer';

import PageTabNavigation from './components/PageTabNavigation';
import TrendingPageHeader from './components/TrendingPageHeader';

export default async function Layout({ children }: { children: ReactNode }) {
  const { isMobile } = await checkDevice();

  const renderMobile = () => {
    return <BasicLayout header={<TrendingPageHeader />}>{children}</BasicLayout>;
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
