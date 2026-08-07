/**
 * 답변이 도착하기 전 자리를 미리 잡아둔다.
 *
 * ★실측(390×844): 첫 페인트에서 콘텐츠는 173px 에서 끝나고 입력바는 760px —
 * **587px(화면의 70%)이 빈 공간**이었다. 답이 올지 모르는 4~6초 동안 유저가
 * 가장 불안한 순간에 화면이 비어 있다.
 *
 * 부수 효과로 레이아웃 점프도 없앤다(실측 scrollHeight 844 → 1479 한 프레임 635px 점프).
 * 최종 블록(가격대 카드 + 목록)과 **같은 높이·같은 모양**을 잡아야 의미가 있다.
 */
const Shimmer = ({ className = '' }: { className?: string }) => (
  <div className={`skeleton rounded bg-gray-100 ${className}`} />
);

export default function AnswerSkeleton() {
  return (
    <div className="flex gap-2.5" aria-hidden>
      <span className="mt-0.5 size-7 shrink-0 rounded-full bg-gray-100" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {/* 판정 카드 */}
        <div className="rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-4 py-3">
          <Shimmer className="h-[15px] w-3/4" />
        </div>

        {/* 가격대 카드 — 최저/구간/최고 3칸 */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <Shimmer className="h-3.5 w-12" />
            <Shimmer className="h-2.5 w-14" />
          </div>
          <div className="grid gap-px overflow-hidden rounded-xl bg-gray-100 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-baseline justify-between gap-3 bg-white px-3 py-2.5 md:flex-col md:items-start md:gap-1 md:py-3"
              >
                <Shimmer className="h-3 w-8" />
                <Shimmer className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        </div>

        {/* 딜 목록 — 모바일 3건 */}
        <div className="flex flex-col gap-2">
          <Shimmer className="h-3 w-24" />
          <div className="grid gap-2 md:grid-cols-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border border-gray-200 bg-white p-3">
                <Shimmer className="mb-1.5 h-2.5 w-16" />
                <Shimmer className="mb-1 h-3 w-full" />
                <Shimmer className="h-[15px] w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
