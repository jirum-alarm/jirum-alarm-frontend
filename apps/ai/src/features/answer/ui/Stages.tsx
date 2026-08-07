/**
 * 작업 추적(trace). AI chat UI 관행대로:
 * - 끝난 단계는 남겨서 "무엇을 근거로 답했나"를 보이게 한다
 * - 진행 중 단계만 강조하고, 끝나면 접어서 접근 가능하게 남긴다
 * - 단계 텍스트는 서버가 실제 작업 경계에서 보낸 것이다(가짜 지연 없음)
 */
export default function Stages({ stages, done }: { stages: string[]; done: boolean }) {
  if (stages.length === 0 && !done) {
    return (
      <p className="flex items-center gap-1.5 pl-1 text-[13px] text-gray-500">
        <span className="dot size-1.5 rounded-full bg-gray-400" />
        <span
          className="dot size-1.5 rounded-full bg-gray-400"
          style={{ animationDelay: '.16s' }}
        />
        <span
          className="dot size-1.5 rounded-full bg-gray-400"
          style={{ animationDelay: '.32s' }}
        />
        <span className="sr-only">답변을 준비하고 있어요</span>
      </p>
    );
  }

  if (stages.length === 0) return null;

  /**
   * 끝나도 단계를 **접지 않는다**. 예전엔 `<details>` 로 "N단계로 확인했어요"
   * 한 줄로 합쳤는데, 답이 나오는 순간 근거가 사라져서 화면이 뒤바뀌어 보였다.
   * 근거는 답변 옆에 계속 남아 있어야 신뢰 장치로 작동한다.
   */
  if (done) {
    return (
      <ol className="flex flex-col gap-1 pl-1">
        {stages.map((s, i) => (
          <li key={`${s}-${i}`} className="flex items-center gap-2 text-[12px] text-gray-500">
            <Check />
            {s}
          </li>
        ))}
      </ol>
    );
  }

  /**
   * 진행 중엔 지나온 단계를 **전부 남긴다**. "무엇을 근거로 답했나"가
   * 실시간으로 쌓이는 것 자체가 이 앱의 신뢰 장치라, 한 줄로 합치지 않는다.
   * 끝난 단계는 흐리게, 현재 단계만 강조.
   */
  return (
    <ol className="flex flex-col gap-1.5 pl-1" aria-live="polite">
      {stages.map((s, i) => {
        const active = i === stages.length - 1;
        return (
          <li
            key={`${s}-${i}`}
            className={
              active
                ? 'rise flex items-center gap-2 text-[13px] font-medium text-gray-700'
                : 'flex items-center gap-2 text-[13px] text-gray-500'
            }
          >
            {active ? <Spinner /> : <Check />}
            {s}
            {active ? <span className="text-gray-300">…</span> : null}
          </li>
        );
      })}
    </ol>
  );
}

function Spinner() {
  return (
    <svg className="size-3.5 shrink-0 animate-spin text-gray-500" viewBox="0 0 24 24" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        opacity=".2"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Check() {
  return (
    <svg
      className="size-3.5 shrink-0 text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      aria-hidden
    >
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
