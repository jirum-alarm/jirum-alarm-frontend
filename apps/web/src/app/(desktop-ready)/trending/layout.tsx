import { ReactNode } from 'react';

import { checkDevice } from '@/shared/actions/agent';
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
        {/* h1 은 페이지마다(실시간=live/page.tsx, 랭킹=탭별 TrendingContainer). 레이아웃에 두면 두 화면·모든 탭이
            같은 h1 이었다. 데스크톱 분기도 잊지 말 것 — 크롤러는 대부분 데스크톱 UA 다(2026-09-02 실측). */}
        <div className="max-w-layout-max mx-auto">{children}</div>
      </div>
    );
  };

  return isMobile ? renderMobile() : renderDesktop();
}
