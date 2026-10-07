import { checkDevice } from '@/app/actions/agent';

import MyPageSidebar from './MyPageSidebar';

/**
 * PC 마이페이지 틀: 왼쪽 사이드바(프로필·메뉴) + 오른쪽 내용. 모바일은 children 그대로.
 * /mypage/** · /like · /alarm(로그인 시)이 쓴다.
 *
 * 내용 쪽 페이지는 BasicLayout 그대로다 — BasicLayout 의 PC 기본(가운데 672px·GNB 만큼 pt-14)을
 * 여기서 왼쪽 정렬·pt-0 으로 덮는다. BasicLayout 의 pc: 클래스(.pc 하위 선택자)를 이기려고 important.
 */
export default async function MyPageShell({ children }: { children: React.ReactNode }) {
  const { isMobile } = await checkDevice();
  if (isMobile) return children;

  return (
    <div className="max-w-layout-max mx-auto flex gap-12 px-5 pt-14">
      <MyPageSidebar />
      <div className="min-w-0 flex-1 [&>[data-basic-layout]]:mx-0! [&>[data-basic-layout]]:max-w-3xl! [&>[data-basic-layout]]:pt-0!">
        {children}
      </div>
    </div>
  );
}
