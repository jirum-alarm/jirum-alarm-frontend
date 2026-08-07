import Link from 'next/link';

import { getSession } from '@/features/answer/model/session';
import Chat from '@/features/answer/ui/Chat';

import type { Metadata } from 'next';

type Params = { params: Promise<{ question: string }> };

const decode = (raw: string) => {
  try {
    return decodeURIComponent(raw).trim().slice(0, 40);
  } catch {
    // 잘못된 % 인코딩이면 원문을 그대로 — 빈 방을 보여주는 것보다 낫다
    return raw.trim().slice(0, 40);
  }
};

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const question = decode((await params).question);
  return { title: `${question} — 지름알림 시세 조회`, robots: { index: false, follow: false } };
}

export default async function RoomPage({ params }: Params) {
  const question = decode((await params).question);
  // 티어는 서버가 정한다 — 클라이언트가 localStorage 로 member 를 자칭하지 못하게
  const session = await getSession();

  return (
    <>
      <div className="ambient" aria-hidden />
      <main className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 md:max-w-[720px] md:px-6">
        {/*
         * 배경은 뷰포트 전폭(w-screen + 좌우 음수 마진), 내용은 컬럼 안.
         * 그냥 -mx-6 로 두면 1280px 화면에서 720px 짜리 흰 띠가 화면 가운데만
         * 지나간다(실측 header[280,1000] vs viewport 1280).
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
          <p className="truncate text-[13px] font-medium text-gray-500">지름알림</p>
        </header>

        {/* key: 같은 방에서 다른 질문으로 넘어가도 스트림 상태가 섞이지 않게 리마운트 */}
        <Chat key={question} question={question} tier={session.tier} />
      </main>
    </>
  );
}
