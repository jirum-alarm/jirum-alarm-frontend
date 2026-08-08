'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { isBlocked, QUOTA, remaining, shouldWarn } from '../model/quota';

import { roomHref } from './examples';
import { startRoomTransition } from './transition';

import type { QuotaState } from '../model/quota';

/**
 * 입력창. 제출 방식이 **두 갈래**다:
 *
 * - `onSubmit` 이 있으면(대화방 안) 그걸 부른다 — 같은 방에 턴을 쌓는 게 멀티턴이므로
 *   라우팅하면 안 된다(리마운트되면 앞 대화가 화면에서 사라진다).
 * - 없으면(홈) 새 방으로 라우팅한다. 전환 애니메이션은 그때만 의미가 있다.
 *
 * `quota` 가 null 이면 아직 안 읽은 것(홈 화면 등) — 아무것도 표시하지 않는다.
 */
export default function Composer({
  busy = false,
  quota = null,
  inRoom = false,
  onSubmit,
}: {
  busy?: boolean;
  quota?: QuotaState | null;
  /** 대화방(하단 고정) 쪽 입력창인지. 전환 애니메이션이 이 마커를 기다린다. */
  inRoom?: boolean;
  /** 있으면 라우팅 대신 이걸 부른다(멀티턴). */
  onSubmit?: (question: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const router = useRouter();

  const walled = quota != null && isBlocked(quota);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // 질문은 서버 DTO 가 200자까지 받는다 — 여기서 40자로 깎으면 문장형 질문이 잘린다
    const q = draft.trim().slice(0, 200);
    if (!q || busy || walled) return;
    setDraft('');

    if (onSubmit) {
      onSubmit(q);
      return;
    }
    startRoomTransition(() => router.push(roomHref(q)));
  };

  return (
    <form onSubmit={submit}>
      {/*
       * 남은 횟수. 벽에 닿기 **전에만** 뜬다 — 닿은 뒤엔 답변 자리의 QuotaWall 이
       * 같은 말을 더 크게 하므로 둘이 겹치면 잔소리가 된다.
       */}
      {quota && shouldWarn(quota) && (
        <p className="mb-2 text-center text-[12px] text-gray-500">
          {QUOTA[quota.tier].period === '월' ? '이번 달' : '오늘'} 남은 질문{' '}
          <b className="text-gray-700 tabular-nums">{remaining(quota)}회</b>
          {quota.tier === 'anon' && ' · 로그인하면 더 물어볼 수 있어요'}
        </p>
      )}
      {/*
       * ★relative 는 **input 을 감싼 이 div** 에 있어야 한다. form 에 걸면
       * 위 쿼터 문구(26px)만큼 아이콘·전송버튼이 위로 떠서 입력창 밖에 뜬다
       * (실측: input.top 772 인데 button.top 754). 오버레이의 기준은
       * "폼 전체"가 아니라 "입력창"이다.
       */}
      {/* vt-composer: 홈/대화방 양쪽 입력창을 같은 요소로 묶어 morph 시킨다 */}
      <div className="vt-composer relative" data-room-composer={inRoom || undefined}>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={walled ? '무료 질문을 다 썼어요' : '예) 콜라 요즘 얼마'}
          aria-label="검색어"
          disabled={walled}
          maxLength={40}
          enterKeyHint="send"
          className="focus-visible:outline-secondary-400 h-[52px] w-full rounded-full border border-gray-300 bg-white pr-[52px] pl-[46px] text-[15px] shadow-sm placeholder:text-gray-400 focus-visible:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1 disabled:bg-gray-50 disabled:text-gray-400"
        />
        <svg
          className="pointer-events-none absolute top-[17px] left-4 size-[18px] text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        {/*
         * 히트 영역 44px(iOS 최소) 확보. 보이는 원은 36px 그대로 두고 패딩으로만 넓힌다 —
         * 실측에서 36×36 이라 미달이었다. before:content 로 터치 영역만 키운다.
         */}
        <button
          type="submit"
          disabled={busy || walled || draft.trim().length === 0}
          aria-label="물어보기"
          className="tappable absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-gray-900 text-white before:absolute before:-inset-1 before:content-[''] disabled:opacity-25"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            aria-hidden
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      </div>
    </form>
  );
}
