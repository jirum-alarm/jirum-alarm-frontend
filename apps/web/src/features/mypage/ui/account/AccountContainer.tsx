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
  // 그래서 높이를 늘려 끝에 붙이는 구조 자체를 버렸다. 콘텐츠가 한 화면에 들어오는
  // 페이지라 h-full 이 필요 없고, 버튼 위치가 var 타이밍에 의존하지 않게 된다.
  // pb 는 공통 var 를 쓰되(cba2d47a 관행) 이제 안전망 역할만 한다.
  return (
    <div className="flex flex-col px-5 pb-[calc(1rem+var(--bottom-nav-padding))]">
      <div className="border-b border-b-gray-300 pt-6 pb-8">
        <MovePage to="/mypage/account/nickname" title="닉네임" subtitle={me?.nickname} />
        <MovePage to="/mypage/account/personal" title="개인정보" />
        <MovePage to="/mypage/account/password" title="비밀번호" />
      </div>
      <div className="flex flex-col pt-8">
        <div className="pb-[22px]">
          <span className="text-sm text-gray-600">이메일 주소</span>
        </div>
        <div>
          <span className="text-gray-900">{me?.email}</span>
        </div>
        <div className="flex justify-center pt-10">
          <AccountManagement />
        </div>
      </div>
    </div>
  );
};

export default AccountContainer;
