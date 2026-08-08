import type { Tier } from '@/features/answer/model/quota';

const WEB_ORIGIN = 'https://jirum-alarm.com';

/**
 * 헤더 우측 액션. 홈·대화방이 같이 쓴다.
 *
 * tier 는 서버에서 내려받은 값만 받는다 — 로그인 판정 쿠키가 httpOnly 라
 * 클라에서 다시 물으면 첫 페인트에 "로그인" 이 깜빡였다 사라진다(session.ts).
 *
 * 대화방에선 `compact` 로 아이콘만 쓴다. 390px 에서 질문 제목과 나란히 두면
 * 글자 버튼이 제목을 밀어낸다(실측: 제목이 여백 없이 버튼에 붙는다).
 *
 * ponytail: 아바타·드롭다운 없음. ai 앱에 계정 메뉴가 생기면 그때.
 */
export default function HeaderActions({
  tier,
  compact = false,
  className = '',
}: {
  tier: Tier;
  compact?: boolean;
  className?: string;
}) {
  const isAnon = tier === 'anon';
  const accountHref = isAnon ? `${WEB_ORIGIN}/login` : `${WEB_ORIGIN}/mypage`;
  const accountLabel = isAnon ? '로그인' : '내 정보';

  if (compact) {
    return (
      <nav className={`flex items-center gap-0.5 ${className}`}>
        <a
          href={WEB_ORIGIN}
          className="tappable flex h-9 items-center rounded-full px-2 text-[13px] font-medium text-gray-500 active:bg-gray-100"
        >
          핫딜
        </a>
        {/*
         * ★비로그인은 아이콘이 아니라 글자다. 아이콘만 두면 로그인·내 정보가
         * 같은 사람 모양이라 로그인 상태로 오해된다(실제 지적받음 2026-08-08).
         * 로그인은 여기서 제일 중요한 행동이라 애매하게 두면 안 된다.
         */}
        {isAnon ? (
          <a
            href={accountHref}
            className="tappable flex h-9 items-center rounded-full bg-gray-900 px-2.5 text-[13px] font-semibold text-white active:bg-gray-700"
          >
            로그인
          </a>
        ) : (
          <a
            href={accountHref}
            aria-label={accountLabel}
            title={accountLabel}
            className="tappable flex size-9 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
          >
            <UserIcon />
          </a>
        )}
      </nav>
    );
  }

  return (
    <nav className={`flex items-center gap-0.5 ${className}`}>
      <a
        href={WEB_ORIGIN}
        className="tappable flex h-9 items-center rounded-full px-2.5 text-[13px] font-medium text-gray-500 active:bg-gray-100"
      >
        핫딜 보러가기
      </a>
      <a
        href={accountHref}
        className={
          isAnon
            ? 'tappable flex h-9 items-center rounded-full bg-gray-900 px-3 text-[13px] font-semibold text-white active:bg-gray-700'
            : 'tappable flex h-9 items-center rounded-full px-2.5 text-[13px] font-medium text-gray-500 active:bg-gray-100'
        }
      >
        {accountLabel}
      </a>
    </nav>
  );
}

const UserIcon = () => (
  <svg
    className="size-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </svg>
);
