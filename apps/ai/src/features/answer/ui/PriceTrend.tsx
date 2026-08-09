import React, { useState } from 'react';

import { MIN_POINTS_FOR_TREND, type PriceConfidence, type PricePoint } from '../model/types';

const won = (n: number) => n.toLocaleString('ko-KR');

const TICKS = 3;

export default function PriceTrend({
  points,
  current,
  confidence,
}: {
  points: PricePoint[];
  current: number;
  confidence: PriceConfidence;
}) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const byDate = new Map<string, number>();
  for (const p of points) {
    if (p.price <= 0 || !p.date) continue;
    const prev = byDate.get(p.date);
    if (prev == null || p.price < prev) byDate.set(p.date, p.price);
  }
  const series = [...byDate.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  if (series.length < MIN_POINTS_FOR_TREND) return null;

  const prices = series.map(([, v]) => v);
  const lo = Math.min(...prices, current);
  const hi = Math.max(...prices, current);
  const span = hi - lo;

  const pad = span > 0 ? span * 0.05 : Math.max(1, hi * 0.05);
  const axisLo = lo - pad;
  const axisHi = hi + pad;
  const axisSpan = axisHi - axisLo;

  const W = 300;
  const H = 110;
  const x = (i: number) => (series.length === 1 ? W / 2 : (i / (series.length - 1)) * W);
  const y = (v: number) => Math.max(0, Math.min(H, H - ((v - axisLo) / axisSpan) * H));

  const d = 'M ' + series.map(([, v], i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' L ');
  const areaD = d + ` L ${x(series.length - 1).toFixed(1)},${H} L ${x(0).toFixed(1)},${H} Z`;

  const lowIdx = prices.indexOf(Math.min(...prices));
  const lowest = prices[lowIdx];
  const first = prices[0];
  const last = prices[prices.length - 1];

  const drop = first > 0 ? (first - last) / first : 0;
  const direction =
    drop > 0.05
      ? '내려가는 중이에요 ↘'
      : drop < -0.05
        ? '올라가는 중이에요 ↗'
        : '큰 변동은 없어요 ➔';

  const gapFromLow = current - lowest;

  const spanLabel = (() => {
    const [a, b] = [series[0][0], series[series.length - 1][0]];
    const months =
      (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 +
      (Number(b.slice(5, 7)) - Number(a.slice(5, 7)));
    if (months >= 12) return `최근 ${Math.floor(months / 12)}년`;
    if (months >= 1) return `최근 ${months}개월`;
    return '최근 한 달';
  })();

  const tickValues = Array.from({ length: TICKS }, (_, i) => axisHi - (axisSpan * i) / (TICKS - 1));

  return (
    <div className="mt-1 mb-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[15px] font-bold text-gray-900">
          <span className="text-[16px] text-blue-500">📈</span> {spanLabel} 가격 흐름
        </span>
        <span className="shrink-0 rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-600 tabular-nums">
          {series.length}개 시점
        </span>
      </div>

      <div className="flex gap-2">
        {/* Y-axis */}
        <div className="flex w-12 shrink-0 flex-col justify-between py-0.5 text-right text-[10px] font-medium text-gray-400 tabular-nums">
          {tickValues.map((v) => (
            <span key={v}>{won(Math.round(v))}</span>
          ))}
        </div>

        <div
          className="group relative h-[110px] min-w-0 flex-1 cursor-crosshair"
          onMouseLeave={() => setHoveredIdx(null)}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            // Handle edge case where series length is 1
            if (series.length <= 1) {
              setHoveredIdx(0);
              return;
            }
            const xPos = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
            const percent = xPos / rect.width;
            const index = Math.round(percent * (series.length - 1));
            setHoveredIdx(Math.max(0, Math.min(series.length - 1, index)));
          }}
        >
          {/* HTML Grid Lines (Resizes perfectly without distortion) */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
            {tickValues.map((v) => (
              <div key={v} className="w-full border-b border-dashed border-gray-200" />
            ))}
          </div>

          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
              <style>
                {`
                  @keyframes drawLine {
                    to { stroke-dashoffset: 0; }
                  }
                  .animate-draw {
                    stroke-dasharray: 1500;
                    stroke-dashoffset: 1500;
                    animation: drawLine 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                  }
                  .animate-fade-in {
                    opacity: 0;
                    animation: fadeIn 0.8s ease-out 0.6s forwards;
                  }
                  @keyframes fadeIn {
                    to { opacity: 1; }
                  }
                `}
              </style>
            </defs>

            {/* Area Fill */}
            <path d={areaD} fill="url(#trendGradient)" className="animate-fade-in" />

            {/* Line */}
            <path
              d={d}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              className="animate-draw"
            />
          </svg>

          {/* HTML Overlay for Tooltips and Dots (Perfect circles) */}
          <div className="pointer-events-none absolute inset-0">
            {/* Lowest point indicator */}
            <div
              className="animate-fade-in absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500 shadow-sm"
              style={{
                left: `${series.length === 1 ? 50 : (lowIdx / (series.length - 1)) * 100}%`,
                top: `${(y(lowest) / H) * 100}%`,
              }}
            />

            {/* Current point indicator */}
            <div
              className="animate-fade-in absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-red-500 shadow-sm"
              style={{ left: `100%`, top: `${(y(last) / H) * 100}%` }}
            />

            {/* Interactive elements on Hover */}
            {hoveredIdx !== null && (
              <>
                {/* Visible vertical guideline */}
                <div
                  className="absolute top-0 bottom-0 -translate-x-px border-l border-dashed border-blue-300"
                  style={{
                    left: `${series.length === 1 ? 50 : (hoveredIdx / (series.length - 1)) * 100}%`,
                  }}
                />

                {/* Visible dot on hover */}
                <div
                  className="absolute size-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[2.5px] border-blue-600 bg-white shadow-sm transition-all duration-75"
                  style={{
                    left: `${series.length === 1 ? 50 : (hoveredIdx / (series.length - 1)) * 100}%`,
                    top: `${(y(prices[hoveredIdx]) / H) * 100}%`,
                  }}
                />

                {/* Tooltip */}
                <div
                  className="absolute z-10 -translate-x-1/2 -translate-y-full pb-2 transition-all duration-75"
                  style={{
                    left: `${series.length === 1 ? 50 : (hoveredIdx / (series.length - 1)) * 100}%`,
                    top: `${(y(prices[hoveredIdx]) / H) * 100}%`,
                  }}
                >
                  <div className="animate-in fade-in zoom-in relative rounded-lg bg-gray-900 px-2.5 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-xl duration-100">
                    <div className="mb-0.5 text-[9px] opacity-80">
                      {series[hoveredIdx][0].slice(5).replace('-', '/')}
                    </div>
                    <div>{won(prices[hoveredIdx])}원</div>
                    <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 border-t-[5px] border-r-[5px] border-l-[5px] border-t-gray-900 border-r-transparent border-l-transparent"></div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-2 flex justify-between pl-[56px] text-[10px] font-medium text-gray-400">
        <span>{series[0][0].slice(5).replace('-', '/')}</span>
        <span>{series[series.length - 1][0].slice(5).replace('-', '/')}</span>
      </div>

      <div className="mt-4 rounded-xl border border-blue-100/50 bg-blue-50/50 px-4 py-3 text-[13px] leading-relaxed text-gray-700">
        <span className="mr-1 font-semibold text-gray-900">{direction}</span>
        {gapFromLow > 0 ? (
          <>
            그동안 가장 싸던 때({won(lowest)}원)보다{' '}
            <b className="text-rose-600 tabular-nums">{won(gapFromLow)}원</b> 높아요.
          </>
        ) : (
          <b className="text-blue-600">
            지금이 {spanLabel.replace('최근 ', '')} 중 가장 싼 가격이에요!
          </b>
        )}
      </div>

      {confidence !== 'HIGH' && (
        <p className="mt-3 text-center text-[11px] leading-snug text-gray-400">
          비슷한 상품 딜로 그린 추이예요. 규격이 다를 수 있어요.
        </p>
      )}
    </div>
  );
}
