import { text } from '@jirum/design-system/recipes';
import { Metadata } from 'next';

import { cn } from '@/shared/lib/cn';

import { decide, loadRequest } from './actions';

/**
 * AI 비서(Claude·ChatGPT)가 지름알림 계정에 연결하려 할 때의 동의 화면. 로그인 안 했으면 로그인 뒤 이리로 돌아온다.
 * 이름은 AI 비서가 등록 때 보낸 값이라 꾸밀 수 있어서, 승인 뒤 돌아갈 주소의 호스트를 같이 보여 준다.
 */
export const metadata: Metadata = {
  title: 'AI 비서 연결 | 지름알림',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const CAN_DO = [
  '상품이 지금 사도 되는 가격인지 판정해요',
  '이 계정에 키워드 가격 알림을 걸고, 보고, 지워요',
];

export default async function McpAuthorizePage({
  searchParams,
}: {
  searchParams: Promise<{ req?: string }>;
}) {
  const { req } = await searchParams;
  const info = req ? await loadRequest(req) : null;

  return (
    <main className="max-w-mobile-max pc:pt-24 mx-auto w-full px-5 pt-14 pb-24">
      <article className="text-15 space-y-8 leading-relaxed text-gray-800">
        {info && req ? (
          <>
            <header>
              <h1 className="text-2xl font-bold text-gray-900">AI 비서 연결</h1>
              <p className="mt-3">
                <strong>{info.clientName}</strong>이(가) 내 지름알림 계정에 연결하려고 해요.
              </p>
            </header>

            <section>
              <h2 className={cn(text.title, 'mb-3')}>연결하면 할 수 있는 것</h2>
              <ul className="list-disc space-y-2 pl-5">
                {CAN_DO.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <p className={cn(text.muted, 'mt-3')}>
                허용하면 <span className="font-mono break-all">{info.redirectHost}</span> 로
                돌아가요. 연결을 끊으려면 AI 비서의 커넥터 설정에서 지름알림을 지우면 돼요.
              </p>
            </section>

            <form action={decide} className="flex gap-3">
              <input type="hidden" name="req" value={req} />
              <button
                type="submit"
                name="approve"
                value="0"
                className="flex-1 rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold text-gray-900"
              >
                거절
              </button>
              <button
                type="submit"
                name="approve"
                value="1"
                className="flex-1 rounded-full bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
              >
                허용
              </button>
            </form>
          </>
        ) : (
          <header>
            <h1 className="text-2xl font-bold text-gray-900">연결 요청이 만료됐어요</h1>
            <p className="mt-3">
              10분이 지났거나 이미 처리한 요청이에요. AI 비서에서 지름알림 연결을 다시 시작해
              주세요.
            </p>
          </header>
        )}
      </article>
    </main>
  );
}
