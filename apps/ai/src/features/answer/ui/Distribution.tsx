import { MIN_SAMPLE_FOR_QUARTILE } from '../model/types';

const won = (n: number) => n.toLocaleString('ko-KR');

const quantile = (sorted: number[], q: number) =>
  sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))];

/**
 * 가격 요약.
 *
 * ★차트를 버린 이유(실측 2026-08-07): 키워드별 최고/최저 배율이 **20~31배**다
 * (기저귀 10,900~213,700 / 라면 4,100~79,000 / 생수 707~21,990).
 * 선형축은 점이 왼쪽에 뭉쳐 안 보이고, 로그축은 눈금을 읽을 수 없다 —
 * 어느 쪽이든 20배 범위를 한 줄 그래프로 만들면 "알아보기 어렵다".
 *
 * 그래서 그래프 대신 **읽히는 숫자 세 개**만 준다: 최저 / 절반이 몰린 구간 / 최고.
 * "중앙 82,000원" 같은 단일 대표값은 대용량 박스와 샘플이 섞인 값이라 쓰지 않는다.
 * 표본이 적으면 구간을 만들지 않고 최저·최고만 말한다.
 */
export default function Distribution({ prices }: { prices: number[] }) {
  const sorted = [...prices].filter((p) => p > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return null;

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const enough = sorted.length >= MIN_SAMPLE_FOR_QUARTILE;

  const q1 = quantile(sorted, 0.25);
  const q3 = quantile(sorted, 0.75);
  // 사분위 폭이 3배를 넘으면 "이게 시세다" 라고 읽히면 안 된다 —
  // 실측 기저귀 36,700~197,000(5.4배)은 대용량 박스와 샘플이 섞인 구간이다.
  const spread = q1 > 0 ? q3 / q1 : 0;
  const tooWide = spread > 3;

  const cells: { k: string; v: string; accent?: boolean }[] = [
    { k: '최저', v: `${won(min)}원`, accent: true },
    ...(enough
      ? [
          {
            k: '절반이 이 구간',
            v: `${won(q1)} ~ ${won(q3)}원`,
          },
        ]
      : []),
    { k: '최고', v: `${won(max)}원` },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <span className="text-sm font-bold text-gray-900">가격대</span>
        <span className="shrink-0 text-[11px] text-gray-500 tabular-nums">
          최근 {sorted.length}개
        </span>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-xl bg-gray-100 md:grid-cols-3">
        {cells.map((c) => (
          <div
            key={c.k}
            className="flex items-baseline justify-between gap-3 bg-white px-3 py-2.5 md:flex-col md:items-start md:gap-1 md:py-3"
          >
            <dt className="shrink-0 text-[12px] text-gray-500">{c.k}</dt>
            <dd
              className={
                c.accent
                  ? 'text-error-600 text-[15px] font-bold tabular-nums'
                  : 'text-[14px] font-semibold text-gray-800 tabular-nums'
              }
            >
              {c.v}
            </dd>
          </div>
        ))}
      </dl>

      {!enough && (
        <p className="mt-2.5 text-[11px] leading-snug text-gray-500">
          {/* "표본"은 통계 용어라 일상어로. 뜻은 그대로 전달된다 */}
          {sorted.length}개는 너무 적어서 평균이나 구간을 말하지 않았어요.
        </p>
      )}
      {enough && tooWide && (
        <p className="mt-2.5 text-[11px] leading-snug text-gray-500">
          용량·수량이 섞여 있어 가격대가 넓어요. 같은 규격끼리 비교하세요.
        </p>
      )}
    </div>
  );
}
