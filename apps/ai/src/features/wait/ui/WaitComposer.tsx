'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';

/** 예시는 리플레이(2026-10-15)에서 자신 있게 답한 종류를 고루 — 생필품 단위가·기기 총액·상품권 비율. */
const WAIT_EXAMPLES = ['삼다수 2L', '햇반', '에어팟 프로3', 'RTX 5070 Ti', '컬쳐랜드 상품권'];

const waitHref = (q: string) => `/w?q=${encodeURIComponent(q)}`;

/**
 * 「무엇을 기다릴까요?」 입력창.
 *
 * ★결과 화면(/w?q=A)에서 다른 상품(/w?q=B)으로 가면 같은 세그먼트라 loading.tsx 가 안 뜬다 — 새 답(서버 판정 1~3초)이 올
 * 때까지 옛 답이 그대로 멈춰 보여서 한 번 더 누르게 된다(2026-10-15 운영 로그: 같은 문장 판정이 1초 간격으로 두 번).
 * 그래서 이동을 transition 으로 감싸고 기다리는 동안 버튼·안내·옛 답 흐림(html[data-wait-pending], globals.css)을 켠다. 질문(채팅)이 아니라 «상품을 던지는 칸» — 사용자는 묻지 않고 상품명으로 찾는다
 * (2026-10-15 GA4: 28일 검색 1,685건 중 질문형 0, 3단어+ 7.6% 는 상품명 붙여넣기).
 */
export default function WaitComposer({
  initial = '',
  examples = true,
}: {
  initial?: string;
  /** 예시 칩 — 결과 화면에선 끈다(답이 칩 두 줄만큼 밀려 내려간다) */
  examples?: boolean;
}) {
  const [draft, setDraft] = useState(initial);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const go = (q: string) => startTransition(() => router.push(waitHref(q)));

  useEffect(() => {
    document.documentElement.toggleAttribute('data-wait-pending', pending);
    return () => document.documentElement.removeAttribute('data-wait-pending');
  }, [pending]);

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = draft.trim().slice(0, 100);
          if (q.length >= 2 && !pending) go(q);
        }}
        className="relative"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="예) 삼다수 2L, 에어팟 프로3"
          aria-label="기다릴 상품"
          maxLength={100}
          enterKeyHint="search"
          className="focus-visible:outline-secondary-400 text-15 h-[52px] w-full rounded-full border border-gray-300 bg-white pr-[52px] pl-5 shadow-sm placeholder:text-gray-500 focus-visible:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1"
        />
        <button
          type="submit"
          disabled={draft.trim().length < 2 || pending}
          aria-label="알아보기"
          className="tappable absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-gray-900 text-white before:absolute before:-inset-1 before:content-[''] disabled:opacity-25"
        >
          {pending ? (
            <span
              className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
              aria-hidden
            />
          ) : (
            <svg
              className="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              aria-hidden
            >
              <path d="M5 12h14M13 5l7 7-7 7" />
            </svg>
          )}
        </button>
      </form>
      {pending && (
        <p className="text-13 mt-3 text-center text-gray-500" role="status">
          90일 핫딜을 살펴보는 중이에요…
        </p>
      )}
      {examples && !pending && (
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {WAIT_EXAMPLES.map((e) => (
            <li key={e}>
              <Link
                href={waitHref(e)}
                onClick={(ev) => {
                  ev.preventDefault();
                  setDraft(e);
                  go(e);
                }}
                className="tappable text-13 block rounded-full border border-gray-200 bg-white/70 px-3.5 py-2 text-gray-700 active:border-gray-400 active:bg-gray-50"
              >
                {e}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
