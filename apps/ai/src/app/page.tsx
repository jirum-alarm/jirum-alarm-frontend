import AskLock from '@/features/answer/ui/AskLock';
import WaitComposer from '@/features/wait/ui/WaitComposer';
import AppHeader from '@/shared/ui/AppHeader';

/**
 * AI 홈 = 「언제 사나」(2026-10-15 개편). 예전 홈은 시세를 묻는 채팅이었는데(/c/*, 그대로 둠) 8/20 이후 질문 0건이었다.
 * 지름알림만 가진 커뮤니티 핫딜 90일 이력으로 «뭘 살까»가 아니라 «언제 사나»를 답하고, 답 끝에 알림을 건다.
 */
export default function Page() {
  return (
    <>
      <div className="ambient" aria-hidden />
      <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 md:max-w-[720px] md:px-6">
        <AppHeader />

        {/* 시작 화면은 세로 가운데. pt 로 위에 붙이면 아래 2/3 가 빈 화면으로 남는다. */}
        <main className="my-auto py-10">
          <header className="pb-7 text-center">
            <h1 className="text-28 leading-tight font-bold tracking-tight text-gray-900">
              무엇을 <span className="text-error-500">기다릴까요?</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              커뮤니티 핫딜 90일을 보고, 지금 사도 되는지
              <br />
              기다리면 얼마에 오는지 알려드려요
            </p>
          </header>

          <AskLock>
            <WaitComposer />
          </AskLock>
        </main>
      </div>
    </>
  );
}
