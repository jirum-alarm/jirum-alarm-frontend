/**
 * 「언제 사나」 답을 기다리는 동안(LLM 조건 1회 + 90일 계산, 보통 1~3초). 최종 카드와 같은 자리·모양을 잡아
 * 도착할 때 화면이 뛰지 않게 한다(AnswerSkeleton 과 같은 이유).
 */
const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton rounded bg-gray-100 ${className}`} />
);

export default function Loading() {
  return (
    <>
      <div className="ambient" aria-hidden />
      <main
        className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col px-4 md:max-w-[720px] md:px-6"
        aria-busy
      >
        <div className="h-14" />
        <Shimmer className="mb-5 h-[52px] rounded-full" />
        <section className="rounded-3xl border border-gray-200 bg-white p-5" aria-hidden>
          <Shimmer className="h-4 w-16 rounded-full" />
          <Shimmer className="mt-3 h-6 w-2/3" />
          <Shimmer className="mt-2 h-4 w-full" />
          <Shimmer className="mt-5 h-[132px] w-full" />
        </section>
        <p className="text-13 mt-4 text-center text-gray-500">90일 핫딜을 살펴보는 중이에요…</p>
      </main>
    </>
  );
}
