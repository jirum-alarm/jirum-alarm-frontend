import { PAGE } from '@/shared/constants/page';

import { InstallLink } from '../key-visual/AppDownload';

import Title from './Title';

// 소개 페이지는 바깥(검색·SNS·QR)에서 지름알림을 처음 보는 사람을 설치로 데려오는 입구다 — 상단도 웹 메뉴를 늘어놓지 않고
// 「앱 받기」 하나와 설치 없이 둘러볼 길(웹으로 보기)만 둔다. 예전엔 web 상단 메뉴의 손 복제본이라 메뉴마다 웹으로 새어 나갔다.
const Header = () => {
  return (
    <div className="fixed inset-0 bottom-auto z-10 bg-white shadow-xs lg:border-b lg:border-gray-200">
      <header className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
        <Title />
        <div className="flex items-center gap-x-4">
          <a
            href={PAGE.BASE}
            className="text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900"
          >
            웹으로 보기
          </a>
          <InstallLink
            position="header"
            className="bg-primary-500 text-fixed-900 hover:bg-primary-400 rounded-full px-4 py-1.5 text-sm font-bold transition-colors"
          >
            앱 받기
          </InstallLink>
        </div>
      </header>
    </div>
  );
};

export default Header;
