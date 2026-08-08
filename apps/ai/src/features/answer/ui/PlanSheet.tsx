'use client';

import { useEffect, useRef, useState } from 'react';

import { QUOTA } from '../model/quota';

import type { Tier } from '../model/quota';

/**
 * "플랜 알아보기" 시트.
 *
 * ★프라이싱 3열 그리드가 아니라 **세로 스택**이다. 익명·로그인은 상품이 아니라
 * 무료 단계라, 나란히 놓고 비교시키면 "무료 두 개 중 뭘 고르지"가 된다.
 * 지금 어디에 있고(현재), 하나 위가 무엇인지(다음)만 보이면 된다.
 *
 * ★결제가 아직 없다. 그래서 CTA 는 "구독하기"가 아니라 알림 신청이다 —
 * 누르면 아무 일도 안 나는 결제 버튼은 벽보다 신뢰를 더 깎는다.
 *
 * 네이티브 <dialog>: ESC·backdrop·포커스 트랩·inert 가 전부 브라우저 기본 동작.
 * ponytail: 모달 라이브러리 없음. 애니메이션은 CSS 한 줄, 붙일 게 생기면 그때.
 */

const PRICE = '월 4,900원';

type Row = {
  tier: Tier;
  name: string;
  price: string;
  quota: string;
  note: string;
};

const ROWS: Row[] = [
  {
    tier: 'anon',
    name: '둘러보기',
    price: '무료',
    quota: `하루 ${QUOTA.anon.limit}번`,
    note: '로그인 없이 바로',
  },
  {
    tier: 'member',
    name: '로그인',
    price: '무료',
    quota: `하루 ${QUOTA.member.limit}번`,
    note: '매일 자정에 다시 채워져요',
  },
  {
    tier: 'paid',
    name: '프로',
    price: PRICE,
    quota: `한 달 ${QUOTA.paid.limit}번`,
    note: '하루 10번씩 매일 써도 남는 양',
  },
];

export default function PlanSheet({
  tier,
  open,
  onClose,
}: {
  tier: Tier;
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [open2, setOpen2] = useState(false);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  /*
   * 이미 신청한 사람에게 폼을 다시 보여주지 않는다. 열릴 때만 확인한다 —
   * Chat 의 quota state 로 내려받으려면 QuotaState 타입부터 여러 곳을 고쳐야 하는데,
   * 시트가 열리는 순간에만 필요한 값이라 여기서 직접 읽는 게 싸다.
   */
  useEffect(() => {
    if (!open) return;
    let alive = true;
    fetch('/api/quota', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((q: { interested?: boolean } | null) => {
        if (alive && q?.interested) setDone(true);
      })
      .catch(() => {
        // 실패해도 폼을 보여주면 그만이다(중복 신청은 서버 upsert 가 흡수한다)
      });
    return () => {
      alive = false;
    };
  }, [open]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/plan-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        // 서버 검증 메시지를 그대로 보여준다("이메일 형식이 아니에요" 등)
        const body = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
        const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
        setError(msg || '잠시 후 다시 시도해 주세요.');
        return;
      }
      setDone(true);
    } catch {
      setError('연결이 불안정해요. 다시 시도해 주세요.');
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // showModal()/close() 는 명령형이라 open 상태와 직접 동기화해야 한다.
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      /* backdrop 클릭 닫기: dialog 자신이 클릭 대상이면 여백(=backdrop)을 누른 것 */
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      /*
       * <dialog> 의 기본 중앙 정렬은 `margin: auto` 다. 모바일에선 바닥에 붙이려고
       * mb-0 으로 아래 마진만 죽이고, 좌우 auto 는 살려둬야 가운데로 온다
       * (mx 까지 건드리면 데스크톱에서 왼쪽 끝에 처박힌다).
       */
      className="mx-auto mt-auto mb-0 w-full max-w-[420px] rounded-t-3xl bg-white p-0 backdrop:bg-gray-900/40 open:animate-[sheet-up_.22s_ease-out] md:mb-auto md:rounded-3xl"
    >
      <div className="px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-[17px] font-bold text-gray-900">질문 횟수 플랜</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-gray-500">
              질문 한 번마다 실시간으로 가격·커뮤니티 반응을 훑어요. 그래서 횟수가 있어요.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="tappable -mt-1 -mr-1 flex size-8 shrink-0 items-center justify-center rounded-full text-gray-500"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
              <path
                d="M3 3l10 10M13 3L3 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <ul className="mt-4 flex flex-col gap-2">
          {ROWS.map((row) => {
            const current = row.tier === tier;
            const paid = row.tier === 'paid';
            return (
              <li
                key={row.tier}
                className={`rounded-2xl border px-4 py-3 ${
                  paid ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'
                }`}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="flex items-center gap-1.5 text-[14.5px] font-bold text-gray-900">
                    {row.name}
                    {current && (
                      <span className="rounded-full bg-gray-900 px-1.5 py-0.5 text-[10.5px] font-medium text-white">
                        현재
                      </span>
                    )}
                  </p>
                  <p className="text-[13.5px] font-semibold text-gray-900">{row.price}</p>
                </div>
                <p className="mt-1 text-[13px] text-gray-700">{row.quota}</p>
                {/* gray-500: 보조 라벨 하한. gray-400 은 흰 배경에서도 AA 미달 */}
                <p className="mt-0.5 text-[12px] text-gray-500">{row.note}</p>
              </li>
            );
          })}
        </ul>

        {/*
         * ★결제 붙기 전이라 정직하게 대기 등록. 여기서 "구독하기"를 달면
         * 눌러본 사람이 두 번 실망한다(벽 + 죽은 버튼).
         *
         * 3단계: 버튼 → 이메일 입력 → 완료. 처음부터 입력란을 펼치지 않는 이유는
         * 대부분은 가격만 보고 닫기 때문이다 — 안 쓸 폼이 시트의 절반을 차지한다.
         */}
        {done ? (
          <p className="mt-4 rounded-full bg-gray-100 py-3 text-center text-[13.5px] font-medium text-gray-700">
            신청됐어요. 열리면 메일 드릴게요.
          </p>
        ) : open2 ? (
          <form onSubmit={submit} className="mt-4">
            <div className="flex gap-2">
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                aria-label="이메일 주소"
                className="h-11 min-w-0 flex-1 rounded-full border border-gray-300 px-4 text-[14.5px] outline-none focus:border-gray-900"
              />
              <button
                type="submit"
                disabled={busy}
                className="tappable h-11 shrink-0 rounded-full bg-gray-900 px-5 text-[14.5px] font-medium text-white disabled:opacity-50"
              >
                {busy ? '...' : '신청'}
              </button>
            </div>
            {/* 실패를 조용히 삼키지 않는다 — 안 눌린 건지 실패한 건지 알 수 없으면 다시 누른다 */}
            {error && <p className="text-error-500 mt-2 text-[12px]">{error}</p>}
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setOpen2(true)}
            className="tappable mt-4 h-11 w-full rounded-full bg-gray-900 text-[14.5px] font-medium text-white"
          >
            프로 열리면 알려주세요
          </button>
        )}
        <p className="mt-2 text-center text-[11.5px] text-gray-500">
          아직 준비 중이에요. 결제는 열리지 않았어요.
        </p>
      </div>
    </dialog>
  );
}
