import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getSession } from '@/features/answer/model/session';
import Chat from '@/features/answer/ui/Chat';

import type { Metadata } from 'next';

type Search = { searchParams: Promise<{ q?: string }> };

const decode = (raw: string | undefined) => (raw ?? '').trim().slice(0, 200);

export async function generateMetadata({ searchParams }: Search): Promise<Metadata> {
  const q = decode((await searchParams).q);
  return {
    title: q ? `${q} — 지름알림 시세 조회` : '지름알림 시세 조회',
    robots: { index: false, follow: false },
  };
}

/**
 * 새 대화. 질문을 들고 들어와 여기서 대화 id 를 발급받는다.
 *
 * ★홈에서 미리 세션을 만들지 않는 이유: 유저가 질문 없이 이탈하면 빈 대화가 쌓인다.
 * 그래서 첫 질문이 실제로 서버에 닿는 순간 발급하고, `Chat` 이 `history.replaceState` 로
 * URL 을 `/c/<id>` 로 바꾼다 — 그 뒤 새로고침하면 저장된 대화가 복원된다.
 */
export default async function NewConversationPage({ searchParams }: Search) {
  const question = decode((await searchParams).q);
  // 질문 없이 들어오면 보여줄 게 없다 — 홈이 입력창을 갖고 있다
  if (!question) redirect('/');

  const session = await getSession();

  return (
    <>
      <div className="ambient" aria-hidden />
      <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 md:max-w-[720px] md:px-6">
        <header className="sticky top-0 z-10 -mx-[50vw] flex w-screen items-center gap-1 self-center bg-white/85 px-[calc(50vw-min(50vw,240px)+0.5rem)] py-2 backdrop-blur md:px-[calc(50vw-min(50vw,360px)+1rem)]">
          <Link
            href="/"
            aria-label="처음으로"
            className="tappable flex size-11 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
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
          <p className="truncate text-[13px] font-medium text-gray-500">{question}</p>
        </header>

        {/*
         * ★`key` 가 **필수**다(실측 2026-08-08). 홈에서 예시 칩을 누르면 소프트 내비게이션이라
         * `Chat` 이 리마운트되지 않는다 — 그러면 이전 방에서 세운 `fired` ref 가 true 로 남아
         * **새 질문이 영영 발사되지 않고** "답변을 준비하고 있어요"에서 멈춘다.
         * (실제로 "생수"를 눌렀는데 DB 에는 직전 질문 "라면 시세"만 저장돼 있었다.)
         * 직접 URL 로 들어오면 마운트가 새로 일어나 정상 동작해서, 이 버그는
         * **클라 라우팅 경로에서만** 재현된다.
         */}
        <Chat key={question} tier={session.tier} pendingQuestion={question} />
      </main>
    </>
  );
}
