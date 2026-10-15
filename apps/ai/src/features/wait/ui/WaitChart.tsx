'use client';

import { useState } from 'react';

import { unitPriceShort, unitPriceText } from '../model/copy';

import type { WaitPoint, WaitUnit } from '../model/types';

const DAY_MS = 24 * 60 * 60 * 1000;
const W = 320;
const H = 132;
const PAD_Y = 8;

/**
 * 90일 동안 뜬 딜을 점으로 — 가로 날짜, 세로 단위가. 좋은 가격 이하가 초록(좋음), 지금 진행 중은 테두리.
 * 선이 아니라 점인 이유: 딜은 띄엄띄엄 뜨는 사건이고, 「얼마나 자주 그 아래로 떨어지나」가 이 화면의 질문이라
 * 점의 밀도가 곧 답이다. 세로축은 위쪽 5% 를 잘라 극단값 하나가 나머지를 바닥에 눌러 붙이지 않게 한다.
 */
export default function WaitChart({
  points,
  unit,
  goodPrice,
  windowDays,
  now,
}: {
  points: WaitPoint[];
  unit: WaitUnit;
  goodPrice: number | null;
  windowDays: number;
  /** 서버가 그린 시각 — 렌더 중에 시계를 읽지 않는다(하이드레이션 불일치·순수성) */
  now: number;
}) {
  const [hover, setHover] = useState<number | null>(null);
  if (points.length < 2) return null;

  const from = now - windowDays * DAY_MS;
  const sorted = [...points].sort((a, b) => Date.parse(a.postedAt) - Date.parse(b.postedAt));
  const values = sorted.map((p) => p.unitPrice).sort((a, b) => a - b);
  const lo = values[0];
  const hi = values[Math.floor(0.95 * (values.length - 1))];
  const span = hi - lo || hi * 0.1 || 1;
  const yMin = lo - span * 0.08;
  const yMax = hi + span * 0.08;

  const x = (iso: string) => ((Date.parse(iso) - from) / (now - from)) * W;
  const y = (v: number) => {
    const c = Math.min(v, yMax);
    return PAD_Y + (1 - (c - yMin) / (yMax - yMin)) * (H - PAD_Y * 2);
  };
  const isGood = (v: number) => goodPrice != null && v <= goodPrice;
  const hovered = hover != null ? sorted[hover] : null;

  const pick = (clientX: number, rect: DOMRect) => {
    const px = ((clientX - rect.left) / rect.width) * W;
    let best = 0;
    for (let i = 1; i < sorted.length; i++) {
      if (Math.abs(x(sorted[i].postedAt) - px) < Math.abs(x(sorted[best].postedAt) - px)) best = i;
    }
    setHover(best);
  };

  const date = (iso: string) => {
    const d = new Date(iso);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  };

  return (
    <figure className="m-0">
      <div className="flex gap-2">
        <div className="text-10 flex w-9 shrink-0 flex-col justify-between py-1 text-right text-gray-500 tabular-nums">
          <span>{unitPriceShort(unit, yMax)}</span>
          <span>{unitPriceShort(unit, yMin)}</span>
        </div>
        <div
          className="relative h-[132px] min-w-0 flex-1 touch-pan-y"
          onPointerMove={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerDown={(e) => pick(e.clientX, e.currentTarget.getBoundingClientRect())}
          onPointerLeave={() => setHover(null)}
          role="img"
          aria-label={`최근 ${windowDays}일 딜 ${points.length}건의 가격 분포`}
        >
          <svg
            viewBox={`0 0 ${W} ${H}`}
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full overflow-visible"
          >
            <line x1={0} x2={W} y1={H - 0.5} y2={H - 0.5} className="stroke-gray-200" />
            {goodPrice != null && (
              <line
                x1={0}
                x2={W}
                y1={y(goodPrice)}
                y2={y(goodPrice)}
                className="stroke-success-500"
                strokeDasharray="4 3"
                strokeWidth={1.5}
                vectorEffect="non-scaling-stroke"
              />
            )}
          </svg>
          {/* 점은 HTML 로 — preserveAspectRatio=none 인 SVG 안에 그리면 타원으로 늘어난다 */}
          <div className="pointer-events-none absolute inset-0">
            {sorted.map((p, i) => (
              <span
                key={`${p.postedAt}-${i}`}
                className={`absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                  isGood(p.unitPrice) ? 'bg-success-500' : 'bg-gray-300'
                } ${p.live ? 'ring-2 ring-gray-900 ring-offset-1' : 'ring-1 ring-white'}`}
                style={{
                  left: `${(x(p.postedAt) / W) * 100}%`,
                  top: `${(y(p.unitPrice) / H) * 100}%`,
                }}
              />
            ))}
            {hovered && (
              <div
                className="absolute z-10 -translate-x-1/2 -translate-y-full pb-2"
                style={{
                  left: `${Math.min(88, Math.max(12, (x(hovered.postedAt) / W) * 100))}%`,
                  top: `${(y(hovered.unitPrice) / H) * 100}%`,
                }}
              >
                <div className="text-11 rounded-lg bg-gray-900 px-2.5 py-1 whitespace-nowrap text-white shadow-lg">
                  <span className="opacity-70">{date(hovered.postedAt)}</span>{' '}
                  {unitPriceText(unit, hovered.unitPrice)}
                  {hovered.live && <span className="opacity-70"> · 진행 중</span>}
                </div>
              </div>
            )}
          </div>
          {goodPrice != null && (
            <span
              className="text-10 text-success-700 pointer-events-none absolute right-0 mb-0.5 -translate-y-full rounded bg-white/90 px-1 font-semibold"
              style={{ top: `${(y(goodPrice) / H) * 100}%` }}
            >
              좋은 가격 {unitPriceShort(unit, goodPrice)}
            </span>
          )}
        </div>
      </div>
      <figcaption className="text-10 mt-1.5 flex justify-between pl-11 text-gray-500">
        <span>{windowDays}일 전</span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-full bg-gray-300 ring-2 ring-gray-900" />
          진행 중
        </span>
        <span>오늘</span>
      </figcaption>
    </figure>
  );
}
