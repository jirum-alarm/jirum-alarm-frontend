import Link from 'next/link';

import { getSession } from '@/features/answer/model/session';
import HeaderActions from '@/shared/ui/HeaderActions';
import LogoIcon from '@/shared/ui/LogoIcon';

/**
 * 홈 헤더. 서버 컴포넌트다 — 로그인 판정이 httpOnly 쿠키라 서버에서만 된다(session.ts).
 *
 * 대화방은 뒤로가기+제목이 들어가야 해서 자기 헤더를 따로 갖고, 우측 액션만
 * HeaderActions 로 공유한다. 헤더 하나로 합치면 slot prop 이 늘어나기만 한다.
 */
export default async function AppHeader() {
  const { tier } = await getSession();

  return (
    <div className="flex h-14 items-center gap-1.5">
      {/*
       * 로고 32 / 이름 text-lg 는 apps/web 헤더(LogoLink)와 같은 비율이다.
       * ★24px 로 두면 작아 보인다 — viewBox 32 안에서 실제 잉크가 21.6 뿐이라
       * (좌우 여백 10.4) size 를 그대로 눈에 보이는 크기로 읽으면 안 된다.
       */}
      <Link href="/" aria-label="지름알림 AI 홈" className="-ml-1 flex items-center gap-1.5">
        <LogoIcon size={32} />
        <span className="text-lg leading-tight font-bold text-gray-900">지름알림</span>
        {/* AI 표식. 로고 옆 배지라 "지름알림의 AI" 로 읽힌다 — 별도 서비스로 안 보이게. */}
        <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] leading-none font-bold tracking-wide text-white">
          AI
        </span>
      </Link>

      <HeaderActions className="ml-auto" tier={tier} />
    </div>
  );
}
