import { Metadata } from 'next';

import BottomNav from '@/shared/ui/layout/BottomNav';

// (mobile) 그룹은 mypage·like·alarm·login·signup 등 개인화/인증 페이지가 대부분이라
// 기본 noindex. 색인 가치가 있는 예외(policies/*)는 각 page에서 robots.index로 오버라이드.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function MobileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full min-h-screen bg-white">
      {children}
      <BottomNav />
    </div>
  );
}
