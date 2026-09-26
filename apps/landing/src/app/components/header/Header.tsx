import { PAGE } from '@/shared/constants/page';

import GnbActions from './Navigation';
import NavLink from './NavLink';
import Title from './Title';

// web DesktopGNB(apps/web/src/widgets/layout/ui/desktop/DesktopGNB.tsx) 의 NAV_LINKS 와 같은 순서·이름.
// 앱이 달라 코드를 공유하지 못하니 메뉴를 바꾸면 양쪽을 같이 고친다.
const NAV_LINKS = [
  { path: PAGE.HOME, label: '홈' },
  { path: PAGE.TRENDING_LIVE, label: '실시간' },
  { path: PAGE.TRENDING_RANKING, label: '랭킹' },
  { path: PAGE.DEALS, label: '최저가' },
  { path: PAGE.COMMUNITY, label: '커뮤니티' },
];

const Header = () => {
  return (
    <div className="fixed inset-0 bottom-auto z-10 bg-white shadow-xs lg:border-b lg:border-gray-200">
      <header className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        <nav className="flex h-full items-center gap-x-11">
          <Title />
          <div className="hidden h-full items-center gap-x-10 lg:flex">
            {NAV_LINKS.map((nav) => (
              <NavLink key={nav.path} href={PAGE.BASE + nav.path} label={nav.label} />
            ))}
            <NavLink href={PAGE.LANDING} label="소개" isActive />
          </div>
        </nav>
        <GnbActions />
      </header>
    </div>
  );
};

export default Header;
