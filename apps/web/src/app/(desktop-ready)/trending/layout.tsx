import { ReactNode } from 'react';

import { checkDevice } from '@/app/actions/agent';

import BasicLayout from '@/shared/ui/layout/BasicLayout';
import { NAV_TYPE } from '@/shared/ui/layout/BottomNav';

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
      <div className="mt-14 pt-8">
        {/* 데스크톱엔 TrendingPageHeader(=sr-only h1 보유)가 안 깔려 h1 이 0개였다.
            크롤러는 대부분 데스크톱 UA 라 실제로 색인되는 쪽이 이 분기다(2026-09-02 실측). */}
        <h1 className="sr-only">지금 뜨는 핫딜 · 실시간 인기 상품</h1>
        <div className="max-w-layout-max mx-auto">{children}</div>
      </div>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
}
