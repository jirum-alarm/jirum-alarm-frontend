'use client';

import { useSuspenseQuery } from '@tanstack/react-query';

import { AuthQueries } from '@/entities/auth';

import AccountManagement from './AccountManagement';
import MovePage from './MovePage';

const AccountContainer = () => {
  const {
    data: { me },
  } = useSuspenseQuery(AuthQueries.me());
  // 로그아웃·회원탈퇴가 바텀네비에 가려지던 버그(2026-07-31) 수정.
  //
  // 원인은 h-full + flex-1 justify-end 로 버튼을 "컬럼 맨 끝"에 붙인 것.
  // 그 컬럼 끝은 --bottom-nav-padding 이 실제 값을 가질 때만 네비 위에 놓인다.
  // 그런데 이 var 는 html[data-bottom-nav='true'] 에서만 56px+safe-area 가 되고,
  // 그 속성은 BottomNav 의 useLayoutEffect 가 심는다 → SSR·최초 페인트엔 0px.
  // 그 순간 버튼은 네비 아래 74px 로 내려간다(375x667 실측).
  //
  // 버튼은 화면 하단(네비 바로 위)에 두되, 높이를 h-full 로 잡지 않는다. h-full 은
  // 부모를 따라 100vh 까지 늘어나고, 그 끝이 네비 위에 놓이는 건 var 가 값을 가질
  // 때만이라 SSR 에서 깨진다.
  //
  // 대신 뷰포트에서 헤더(56px)와 네비를 직접 뺀다. 네비 몫은 max(56px, var) —
  // var 가 0px 인 SSR·최초 페인트에도 최소 56px 을 확보해 버튼이 네비 아래로
  // 내려가지 않고, JS 주입 후엔 safe-area 포함 실제 값을 쓴다.
  //
  // pb 는 pb-4. 네비 클리어런스는 BasicLayout:42 가 이미 대주므로, 여기서 var 를
  // 또 더하면 56px 이 두 번 들어가 하단에 빈 여백이 생긴다(리포트 2026-07-31).
  return (
    <div className="flex min-h-[calc(100vh-56px-max(56px,var(--bottom-nav-padding,0px)))] flex-col px-5 pb-4">
      <div className="border-b border-b-gray-300 pt-6 pb-8">
        <MovePage to="/mypage/account/nickname" title="닉네임" subtitle={me?.nickname} />
        <MovePage to="/mypage/account/personal" title="개인정보" />
        <MovePage to="/mypage/account/password" title="비밀번호" />
      </div>
      <div className="flex flex-1 flex-col pt-8">
        <div className="pb-[22px]">
          <span className="text-sm text-gray-600">이메일 주소</span>
        </div>
        <div>
          <span className="text-gray-900">{me?.email}</span>
        </div>
        <div className="flex flex-1 items-end justify-center pt-10">
          <AccountManagement />
        </div>
      </div>
    </div>
  );
};

export default AccountContainer;
