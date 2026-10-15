import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getSession } from '@/features/answer/model/session';
import RestrictedNotice from '@/features/answer/ui/RestrictedNotice';
import { fetchWaitEstimate } from '@/features/wait/model/fetchWait';
import WaitComposer from '@/features/wait/ui/WaitComposer';
import WaitResult from '@/features/wait/ui/WaitResult';
import HeaderActions from '@/shared/ui/HeaderActions';

import type { Metadata } from 'next';

type Search = { searchParams: Promise<{ q?: string }> };

/** 판정 시각 — 컴포넌트 렌더 안에서 시계를 읽지 않으려고 밖에서 받는다. */
const clock = () => Date.now();

const decode = (raw: string | undefined) => (raw ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);

export async function generateMetadata({ searchParams }: Search): Promise<Metadata> {
  const q = decode((await searchParams).q);
  return { title: q ? `${q} — 언제 살까` : '언제 살까', robots: { index: false, follow: false } };
}

const Notice = ({ children }: { children: React.ReactNode }) => (
  <p className="text-13 rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center leading-relaxed text-gray-600">
    {children}
  </p>
);

/** 「언제 사나」 답 화면. 서버에서 한 번에 그린다(LLM 조건 1회 + 90일 계산 — 기다리는 동안은 loading.tsx). */
export default async function WaitPage({ searchParams }: Search) {
  const q = decode((await searchParams).q);
  if (q.length < 2) redirect('/');

  const session = await getSession();
  const result = session.tier === 'anon' ? null : await fetchWaitEstimate(q);

  return (
    <>
      <div className="ambient" aria-hidden />
      <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 md:max-w-[720px] md:px-6">
        <header className="flex h-14 items-center gap-1">
          <Link
            href="/"
            aria-label="처음으로"
            className="tappable -ml-2 flex size-11 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
          </Link>
          <HeaderActions compact className="ml-auto shrink-0" tier={session.tier} />
        </header>

        <div className="mb-5">
          <WaitComposer key={q} initial={q} examples={false} />
        </div>

        <div data-wait-result>
          {session.tier === 'anon' || (result && !result.ok && result.reason === 'login') ? (
            <Notice>
              로그인하면 알려 드려요.{' '}
              <a
                href="https://jirum-alarm.com/login"
                className="font-semibold text-gray-900 underline"
              >
                로그인
              </a>
            </Notice>
          ) : result && !result.ok && result.reason === 'forbidden' ? (
            <RestrictedNotice />
          ) : result && result.ok && result.data ? (
            <WaitResult key={q} estimate={result.data} query={q} now={clock()} />
          ) : result && result.ok ? (
            <Notice>어떤 상품인지 알아보지 못했어요. 상품 이름으로 다시 적어 주세요.</Notice>
          ) : (
            <Notice>지금은 답을 만들 수 없어요. 잠시 뒤 다시 시도해 주세요.</Notice>
          )}
        </div>
      </main>
    </>
  );
}
