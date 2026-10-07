import { Metadata } from 'next';

import DesktopReadyLayout from '../(desktop-ready)/layout';

// (mobile) 그룹은 mypage·like·alarm·login·signup 등 개인화/인증 페이지가 대부분이라
// 기본 noindex. 색인 가치가 있는 예외(policies/*)는 각 page에서 robots.index로 오버라이드.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// ponytail: 틀은 (desktop-ready) 와 같다 — PC 는 GNB, 모바일은 바텀네비. 예전엔 바텀네비만 그려서
// PC 에서 이 그룹 페이지로 오면 GNB 가 사라지고 폰 모양 칸 + 모바일 탭바가 떴다.
// 내용은 BasicLayout 의 600px 칸 그대로(pc: 클래스로 GNB 아래에 붙인다). 페이지별 PC 디자인은 필요할 때.
export default DesktopReadyLayout;
