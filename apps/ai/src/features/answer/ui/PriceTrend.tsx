import { MIN_POINTS_FOR_TREND, type PriceConfidence, type PricePoint } from '../model/types';

const won = (n: number) => n.toLocaleString('ko-KR');

/** 축 눈금 3개(위/중간/아래). 5개는 375px 에서 라벨이 겹친다. */
const TICKS = 3;

/**
 * 90일 가격 추이.
 *
 * ★왜 Position 과 별개인가: Position 은 "싼가"에, 추이는 **"더 싸질까"** 에 답한다.
 * 같은 `points` 를 쓰지만 질문이 다르다 — 위치만 있으면 "지금이 하위 20%" 는 알아도
 * 2주 전에 더 내려간 적이 있는지는 모른다.
 *
 * ★Y축 눈금이 **필수**다. 축 없이 선만 그리면 "7,900원"이 싼지 판단이 안 된다.
 * 그리고 축을 붙였으면 **최저점이 하단 눈금에 닿아야** 한다 — 눈으로 그린 좌표는
 * 축과 어긋나서 차트가 거짓말을 한다(목업 검증에서 실제로 잡힌 결함).
 *
 * ★차트를 쓰는 이유(Distribution 은 차트를 버렸는데): 키워드 집계는 20~31배가 섞여
 * 축이 무의미했지만, 추이는 **상품 단위**라 안 섞인다. 실측(2026-08-08, 19건)
 * 추이 내부 스프레드 중앙 1.28배 · 2배 초과 0건 — 선 그래프가 성립하는 범위다.
 */
export default function PriceTrend({
  points,
  current,
  confidence,
}: {
  points: PricePoint[];
  current: number;
  confidence: PriceConfidence;
}) {
  /*
   * 같은 딜이 여러 날 실려 오므로(캐리오버) 날짜별로 최저가만 남긴다.
   * gate 의 historyPrices 는 분포용이라 날짜를 버리는데, 추이는 날짜가 축이라 여기서 따로 접는다.
   */
  const byDate = new Map<string, number>();
  for (const p of points) {
    if (p.price <= 0 || !p.date) continue;
    const prev = byDate.get(p.date);
    if (prev == null || p.price < prev) byDate.set(p.date, p.price);
  }
  const series = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  // 점이 2개면 "추이"가 아니라 선분이다 — 방향을 말할 근거가 안 된다
  if (series.length < MIN_POINTS_FOR_TREND) return null;

  const prices = series.map(([, v]) => v);

  /*
   * 축은 min/max + 5% 여유. 분위(q05~q95)로 좁혀보고 **실측으로 기각했다**(2026-08-08):
   * 콜라 24시점 중 17개가 11,910원 동일값이라 q05 가 그 값을 잡아 축이 11,871~12,740 으로
   * 좁아지고, 중앙영역 점이 20개 → 4개로 **줄었다**(테두리에 눌러붙은 점도 발생).
   * 같은 가격이 반복되는 이 데이터에서는 분위가 축을 좁히는 쪽으로 작동한다.
   */
  const lo = Math.min(...prices, current);
  const hi = Math.max(...prices, current);
  const span = hi - lo;

  /*
   * 축 범위. span 이 0 이면(모두 같은 가격) 0 나누기가 되므로 폭을 만들어 준다.
   * 위아래 5% 여유를 두면 최저·최고점이 테두리에 붙어 잘리지 않는다.
   */
  const pad = span > 0 ? span * 0.05 : Math.max(1, hi * 0.05);
  const axisLo = lo - pad;
  const axisHi = hi + pad;
  const axisSpan = axisHi - axisLo;

  const W = 300;
  const H = 110;
  const x = (i: number) => (series.length === 1 ? W / 2 : (i / (series.length - 1)) * W);
  // 분위 축 밖의 이상치는 테두리에 붙인다 — 잘라내면 선이 끊긴 것처럼 보인다
  const y = (v: number) => Math.max(0, Math.min(H, H - ((v - axisLo) / axisSpan) * H));

  const path = series.map(([, v], i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ');

  const lowIdx = prices.indexOf(Math.min(...prices));
  const lowest = prices[lowIdx];
  const first = prices[0];
  const last = prices[prices.length - 1];

  // 방향은 처음/끝만 보고 말한다. 중간 등락을 "추세"로 해석하면 과대 해석이 된다.
  const drop = first > 0 ? (first - last) / first : 0;
  const direction =
    drop > 0.05 ? '내려가는 중이에요' : drop < -0.05 ? '올라가는 중이에요' : '큰 변동은 없어요';

  const gapFromLow = current - lowest;

  /**
   * 실제 데이터 범위를 사람 말로. 날짜 문자열만 보고 계산하므로 타임존이 끼지 않는다
   * (`new Date()` 로 파싱하면 KST/UTC 경계에서 한 달이 밀린다).
   */
  const spanLabel = (() => {
    const [a, b] = [series[0][0], series[series.length - 1][0]];
    const months =
      (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 +
      (Number(b.slice(5, 7)) - Number(a.slice(5, 7)));
    if (months >= 12) return `최근 ${Math.floor(months / 12)}년`;
    if (months >= 1) return `최근 ${months}개월`;
    return '최근 한 달';
  })();

  // 눈금 라벨은 위에서 아래로(높은 값이 위)
  const tickValues = Array.from({ length: TICKS }, (_, i) => axisHi - (axisSpan * i) / (TICKS - 1));

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        {/*
         * ★제목에 "90일"을 박으면 안 된다. 백엔드 기본창이 90일이어도 실제로 오는 점은
         * 그보다 넓다(실측 2026-08-08: 생수 2025-09-04~2026-08-06 = **11개월**).
         * 라벨을 상수로 쓰면 데이터와 어긋난 순간 차트가 거짓말을 한다 — 범위에서 계산한다.
         */}
        <span className="text-sm font-bold text-gray-900">{spanLabel} 가격 흐름</span>
        <span className="shrink-0 text-[11px] text-gray-500 tabular-nums">
          {series.length}개 시점
        </span>
      </div>

      <div className="flex gap-2">
        {/* Y축 — 없으면 선의 높이가 무슨 뜻인지 알 수 없다 */}
        <div className="flex w-11 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] text-gray-500 tabular-nums">
          {tickValues.map((v) => (
            <span key={v}>{won(Math.round(v))}</span>
          ))}
        </div>

        <div className="relative min-w-0 flex-1">
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="h-[110px] w-full overflow-visible"
            preserveAspectRatio="none"
            role="img"
            aria-label={`90일 가격 추이. 최저 ${won(lowest)}원, 현재 ${won(current)}원.`}
          >
            {tickValues.map((v) => (
              <line
                key={v}
                x1="0"
                y1={y(v).toFixed(1)}
                x2={W}
                y2={y(v).toFixed(1)}
                stroke="#e4e7ec"
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            <polyline
              points={path}
              fill="none"
              stroke="#98a2b3"
              strokeWidth="2"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
            {/* 최저점 — 비교 기준이라 표시한다 */}
            <circle cx={x(lowIdx)} cy={y(lowest)} r="3.5" fill="#667085" />
            {/* 현재가는 마지막 점 위에 얹는다 */}
            <circle
              cx={x(series.length - 1)}
              cy={y(last)}
              r="5"
              fill="#eb001c"
              stroke="#fff"
              strokeWidth="2"
            />
          </svg>
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-[52px] text-[10px] text-gray-500">
        <span>{series[0][0].slice(5).replace('-', '/')}</span>
        <span>{series[series.length - 1][0].slice(5).replace('-', '/')}</span>
      </div>

      <p className="mt-3 border-t border-gray-100 pt-2.5 text-[12.5px] leading-relaxed text-gray-700">
        {direction}
        {gapFromLow > 0 ? (
          <>
            {' '}
            그동안 가장 싸던 때({won(lowest)}원)보다{' '}
            <b className="tabular-nums">{won(gapFromLow)}원</b> 높아요.
          </>
        ) : (
          <> 지금이 {spanLabel.replace('최근 ', '')} 중 가장 싼 가격이에요.</>
        )}
      </p>

      {/*
       * Position 카드와 같은 원칙 — LOW 는 유사상품 추정이므로 한계를 카드 안에 적는다.
       * 추이는 선이 그려져서 더 확신처럼 보이므로, 여기서 빼면 오히려 더 위험하다.
       */}
      {confidence !== 'HIGH' && (
        <p className="mt-2 text-[11px] leading-snug text-gray-500">
          비슷한 상품 딜로 그린 추이예요. 규격이 다를 수 있어요.
        </p>
      )}
    </div>
  );
}
