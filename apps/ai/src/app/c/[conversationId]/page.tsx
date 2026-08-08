import { cookies } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { fetchConversation } from '@/features/answer/model/conversation';
import { getSession } from '@/features/answer/model/session';
import Chat from '@/features/answer/ui/Chat';

import type { Metadata } from 'next';

type Params = { params: Promise<{ conversationId: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { conversationId } = await params;
  const convo = await fetchConversation(conversationId, (await cookies()).toString());
  return {
    title: convo ? `${convo.title} — 지름알림 시세 조회` : '대화 — 지름알림',
    // 대화는 개인 것이다. 색인되면 남의 질문이 검색에 뜬다.
    robots: { index: false, follow: false },
  };
}

/**
 * 대화방. **한 방 = 한 대화**(멀티턴) — 질문마다 URL 이 바뀌지 않는다.
 *
 * 서버에서 대화를 복원해 넘긴다: 새로고침·공유 링크가 성립해야 하고,
 * 클라에서 fetch 하면 첫 페인트가 빈 화면이 된다.
 */
export default async function ConversationPage({ params }: Params) {
  const { conversationId } = await params;
  const convo = await fetchConversation(conversationId, (await cookies()).toString());

  // 없거나 남의 대화면 404. 빈 방을 보여주면 "내 대화가 사라졌다"로 읽힌다.
  if (!convo) notFound();

  // 티어는 서버가 정한다 — 클라이언트가 localStorage 로 member 를 자칭하지 못하게
  const session = await getSession();

  return (
    <>
      <div className="ambient" aria-hidden />
      <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 md:max-w-[720px] md:px-6">
        {/*
         * 배경은 뷰포트 전폭(w-screen + 좌우 음수 마진), 내용은 컬럼 안.
         * 그냥 -mx-6 로 두면 1280px 화면에서 720px 짜리 흰 띠가 화면 가운데만 지나간다.
         */}
        <header className="sticky top-0 z-10 -mx-[50vw] flex w-screen items-center gap-1 self-center bg-white/85 px-[calc(50vw-min(50vw,240px)+0.5rem)] py-2 backdrop-blur md:px-[calc(50vw-min(50vw,360px)+1rem)]">
          {/* size-11(44px) = iOS 최소 터치 타깃. 아이콘은 20px 유지 */}
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
          <p className="truncate text-[13px] font-medium text-gray-500">{convo.title}</p>
        </header>

        <Chat tier={session.tier} conversationId={convo.id} initialTurns={convo.turns} />
      </main>
    </>
  );
}
