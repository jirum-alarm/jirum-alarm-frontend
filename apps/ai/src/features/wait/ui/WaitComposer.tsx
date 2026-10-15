'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

/** 예시는 리플레이(2026-10-15)에서 자신 있게 답한 종류를 고루 — 생필품 단위가·기기 총액·상품권 비율. */
const WAIT_EXAMPLES = ['삼다수 2L', '햇반', '에어팟 프로3', 'RTX 5070 Ti', '컬쳐랜드 상품권'];

const waitHref = (q: string) => `/w?q=${encodeURIComponent(q)}`;

/**
 * 「무엇을 기다릴까요?」 입력창. 질문(채팅)이 아니라 «상품을 던지는 칸» — 사용자는 묻지 않고 상품명으로 찾는다
 * (2026-10-15 GA4: 28일 검색 1,685건 중 질문형 0, 3단어+ 7.6% 는 상품명 붙여넣기).
 */
export default function WaitComposer({ initial = '' }: { initial?: string }) {
  const [draft, setDraft] = useState(initial);
  const router = useRouter();

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = draft.trim().slice(0, 100);
          if (q.length >= 2) router.push(waitHref(q));
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
          className="focus-visible:outline-secondary-400 text-15 h-[52px] w-full rounded-full border border-gray-300 bg-white pr-[52px] pl-5 shadow-sm placeholder:text-gray-400 focus-visible:border-gray-400 focus-visible:outline-2 focus-visible:outline-offset-1"
        />
        <button
          type="submit"
          disabled={draft.trim().length < 2}
          aria-label="알아보기"
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
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </form>
      <ul className="mt-4 flex flex-wrap justify-center gap-2">
        {WAIT_EXAMPLES.map((e) => (
          <li key={e}>
            <Link
              href={waitHref(e)}
              className="tappable text-13 block rounded-full border border-gray-200 bg-white/70 px-3.5 py-2 text-gray-700 active:border-gray-400 active:bg-gray-50"
            >
              {e}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
