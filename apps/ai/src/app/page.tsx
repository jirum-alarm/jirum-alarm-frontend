import Composer from '@/features/answer/ui/Composer';
import ExampleChips from '@/features/answer/ui/ExampleChips';
import QuotaDevBar from '@/features/answer/ui/QuotaDevBar';

export default async function Page() {
  return (
    <>
      <div className="ambient" aria-hidden />
      <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 md:max-w-[720px] md:px-6">
        <div className="flex h-14 items-center gap-1.5">
          <span className="text-[15px] font-bold text-gray-900">
            지름<span className="text-error-500">알림</span>
          </span>
        </div>

        {/* 시작 화면은 세로 가운데. pt 로 위에 붙이면 아래 2/3 가 빈 화면으로 남는다. */}
        <main className="my-auto py-10">
          <header className="pb-7 text-center">
            <h1 className="text-[28px] leading-tight font-bold tracking-tight text-gray-900 md:text-[36px]">
              뭐가 싼지 <span className="text-error-500">물어보세요</span>
            </h1>
            <p className="mt-3 text-[14px] text-gray-500">
              최근 핫딜 데이터로 시세를 계산해서 알려드려요
            </p>
          </header>

          <Composer />

          <div className="mt-5">
            <p className="mb-2.5 text-xs font-medium text-gray-500">이렇게 물어보세요</p>
            <ExampleChips />
          </div>

          {/* 목업 조작 바 — 배포본에는 안 나간다 */}
          {process.env.NODE_ENV !== 'production' && <QuotaDevBar />}
        </main>
      </div>
    </>
  );
}
