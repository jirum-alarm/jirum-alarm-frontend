'use client';

import { nextTier, QUOTA } from '../model/quota';

import type { Tier } from '../model/quota';

/** 로그인은 web 이 갖고 있다. `rtnUrl` 은 web 의 콜백이 읽는 파라미터 이름. */
const WEB_ORIGIN = 'https://jirum-alarm.com';

const loginHref = () => {
  // 로그인 끝나고 지금 보던 질문으로 돌아온다. 서버 렌더 시엔 window 가 없다.
  const back = typeof window === 'undefined' ? '' : window.location.href;
  return `${WEB_ORIGIN}/login${back ? `?rtnUrl=${encodeURIComponent(back)}` : ''}`;
};

/**
 * 쿼터가 소진됐을 때 답변 자리에 뜨는 카드.
 *
 * ★에러 토스트로 끊지 않는다. 벽은 실패가 아니라 **다음 단계 제안**이라,
 * 답이 오던 자리에 답 대신 놓여야 흐름이 끊기지 않는다.
 *
 * ponytail: 목업 — 버튼은 아직 아무 데도 안 간다.
 */

const COPY: Record<Tier, { title: string; body: string; cta: string }> = {
  anon: {
    title: '오늘 무료 질문을 다 썼어요',
    body: `로그인하면 하루 ${QUOTA.member.limit}번까지 물어볼 수 있어요.`,
    cta: '로그인하고 계속하기',
  },
  member: {
    title: '오늘 질문을 다 썼어요',
    body: `내일 다시 ${QUOTA.member.limit}번 채워져요. 더 필요하면 월 ${QUOTA.paid.limit}회 플랜이 있어요.`,
    cta: '플랜 알아보기',
  },
  paid: {
    title: '이번 달 질문을 다 썼어요',
    body: '다음 달에 다시 채워져요.',
    cta: '',
  },
};

export default function QuotaWall({ tier }: { tier: Tier }) {
  const { title, body, cta } = COPY[tier];

  return (
    <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3.5">
      <p className="text-[15px] font-bold text-gray-900">{title}</p>
      <p className="mt-1 text-[13.5px] leading-relaxed text-gray-600">{body}</p>
      {tier === 'anon' ? (
        /*
         * 로그인은 web(jirum-alarm.com)이 갖고 있다. 돌아올 곳을 redirect 로 넘겨
         * 로그인 후 보던 질문으로 복귀시킨다 — 홈으로 떨구면 질문을 다시 쳐야 한다.
         */
        <a
          href={loginHref()}
          className="tappable mt-3 flex h-10 w-full items-center justify-center rounded-full bg-gray-900 text-[14px] font-medium text-white"
        >
          {cta}
        </a>
      ) : nextTier(tier) ? (
        <button
          type="button"
          className="tappable mt-3 h-10 w-full rounded-full bg-gray-900 text-[14px] font-medium text-white"
        >
          {cta}
        </button>
      ) : null}
    </div>
  );
}
