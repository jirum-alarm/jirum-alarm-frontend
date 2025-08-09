import { PAGE } from '@/shared/constants/page';

import GnbActions from './Navigation';
import NavLink from './NavLink';
import Title from './Title';

const Header = () => {
  return (
    <div className="fixed inset-0 bottom-auto z-10 bg-white">
      <header className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        <nav className="flex h-full items-center gap-x-11">
          <Title />
          <div className="hidden h-full items-center gap-x-10 lg:flex">
            <NavLink href={PAGE.BASE + PAGE.HOME} label="홈" />
            <NavLink href={PAGE.BASE + PAGE.RECOMMEND} label="추천" />
            <NavLink href={PAGE.BASE + PAGE.TRENDING} label="랭킹" />
            <NavLink href={PAGE.LANDING} label="소개" isActive />
          </div>
        </nav>
        <GnbActions />
      </header>
    </div>
  );
};

export default Header;
