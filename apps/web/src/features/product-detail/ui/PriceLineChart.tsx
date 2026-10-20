'use client';

import { chartVar } from '@jirum/design-system';
import { shortWon } from '@jirum/domain/price-chart';
import { useMemo, useRef, useState } from 'react';

import type { PriceHistoryPoint } from '@/shared/api/product/product.service';
import { cn } from '@/shared/lib/cn';

import { useRenderedWidth } from '../hooks/useRenderedWidth';
import {
  buildChartGeometry,
  type CurrentProductMarker,
  isPreviewLinkable,
  isSeedDeal,
  won,
} from '../lib/price-history';

import PriceHistoryDealPreview from './PriceHistoryDealPreview';

/** 라인/점은 같은 파랑, 현재 상품만 채운 점으로 구분. 색은 디자인 시스템 차트 역할(앱·AI 그래프와 같은 값, 다크 자동). */
export const CHART = {
  line: chartVar('line'),
  current: chartVar('current'),
  guide: chartVar('guide'),
  currentGuide: chartVar('guide'),
  low: chartVar('low'),
  high: chartVar('high'),
} as const;

export default function PriceLineChart({
  productId,
  points,
  currentMarker,
  currency,
  minPrice,
  maxPrice,
  gradId,
  axisStartMs,
  axisEndMs,
  contentStartMs,
  contentEndMs,
  onTrackClick,
}: {
  /** 지금 보는 상품 — 미리보기 카드가 이 상품이면 링크로 그리지 않는다. */
  productId: number;
  points: PriceHistoryPoint[];
  currentMarker: CurrentProductMarker | null;
  currency: string;
  minPrice: number;
  maxPrice: number;
  gradId: string;
  axisStartMs: number;
  axisEndMs: number;
  contentStartMs: number;
  contentEndMs: number;
  onTrackClick: (element: 'point' | 'deal') => void;
}) {
  // viewBox 를 그려지는 폭과 같게 둔다(1단위 = 1px). 640 고정이던 때는 폰(약 350px)에서 통째로 0.55배가 돼
  // 축·가격 글자가 5.5px, 점이 2px 로 그려졌다(2026-10-15 실측).
  const boxRef = useRef<HTMLDivElement>(null);
  const width = useRenderedWidth(boxRef, 640);
  const height = width < 480 ? 200 : 260;
  const pad = { top: 40, right: 24, bottom: 28, left: 44 };
  const svgRef = useRef<SVGSVGElement>(null);

  // hover: 가이드만 / click: 아래 카드 고정
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [selectedSeed, setSelectedSeed] = useState(true);
  // 마우스 아래 가장 가까운 대상이 이미 고른 것이면 눌러도 바뀌는 게 없다 — 손가락 커서를 거둔다(dead click).
  const [hoverIsSelection, setHoverIsSelection] = useState(false);

  const geo = useMemo(
    () =>
      buildChartGeometry(
        points,
        width,
        height,
        pad,
        axisStartMs,
        axisEndMs,
        contentStartMs,
        contentEndMs,
        currentMarker ? [currentMarker.price] : [],
      ),
    [points, width, height, axisStartMs, axisEndMs, contentStartMs, contentEndMs, currentMarker],
  );

  const orderedPoints = geo.coords;
  const seedCoord = useMemo(() => {
    if (!currentMarker) return null;
    const { x, y } = geo.project(currentMarker.date, currentMarker.price);
    return { ...currentMarker, x, y };
  }, [currentMarker, geo]);

  const defaultIdx = Math.max(0, orderedPoints.length - 1);
  const resolvedSelectedIdx = selectedIdx ?? defaultIdx;

  const viewingCurrent = selectedSeed || !currentMarker;
  const selectedPoint: PriceHistoryPoint | null =
    viewingCurrent && currentMarker
      ? {
          date: currentMarker.date,
          price: currentMarker.price,
          deal: currentMarker.deal,
          deals: [currentMarker.deal],
        }
      : (orderedPoints[resolvedSelectedIdx] ?? null);

  const clientXToPlotX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    return ((clientX - rect.left) / rect.width) * width;
  };

  const nearestIdxFromClientX = (clientX: number) => {
    if (orderedPoints.length === 0) return defaultIdx;
    const x = clientXToPlotX(clientX);
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < orderedPoints.length; i++) {
      const dist = Math.abs(orderedPoints[i].x - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    return best;
  };

  /** 이 x 를 누르면 고를 대상 — 「이 상품」 점이 가장 가까우면 seed, 아니면 그 점. */
  const targetAtClientX = (clientX: number): { seed: true } | { seed: false; idx: number } => {
    const x = clientXToPlotX(clientX);
    const idx = nearestIdxFromClientX(clientX);
    const pointDist = orderedPoints[idx] != null ? Math.abs(orderedPoints[idx].x - x) : Infinity;
    const seedDist = seedCoord ? Math.abs(seedCoord.x - x) : Infinity;
    return seedCoord && seedDist <= pointDist ? { seed: true } : { seed: false, idx };
  };

  const isCurrentSelection = (t: ReturnType<typeof targetAtClientX>) =>
    t.seed ? viewingCurrent : !viewingCurrent && t.idx === resolvedSelectedIdx;

  const selectAtClientX = (clientX: number) => {
    onTrackClick('point');
    const target = targetAtClientX(clientX);
    setHoverIsSelection(true);
    if (target.seed) {
      setSelectedSeed(true);
      return;
    }
    setSelectedSeed(false);
    setSelectedIdx(target.idx);
  };

  const selectedCoord =
    !viewingCurrent && orderedPoints[resolvedSelectedIdx]
      ? orderedPoints[resolvedSelectedIdx]
      : null;

  // 최저·최고 라벨은 각각 한 점에만 — 같은 딜이 여러 날 이어지면(4,750원 4일) 라벨이 겹쳐
  // 「4,75040원40원」처럼 읽혔다. 같은 값이면 마지막 날에 달고, 「이 상품」 라벨과 겹치는 자리는 뺀다
  // (이 상품 라벨이 이미 가격을 보여준다).
  const labelIdxFor = (price: number) => {
    for (let i = orderedPoints.length - 1; i >= 0; i--) {
      const c = orderedPoints[i];
      if (c.price !== price) continue;
      if (currentMarker && isSeedDeal(c.deal, currentMarker.deal.id)) continue;
      if (seedCoord && Math.abs(c.x - seedCoord.x) < 40 && Math.abs(c.y - seedCoord.y) < 28)
        continue;
      return i;
    }
    return -1;
  };
  const lowLabelIdx = labelIdxFor(minPrice);
  const highLabelIdxRaw = labelIdxFor(maxPrice);
  // 최고·최저가 바로 옆 점이면(9,850→9,810원) 두 라벨이 겹친다 — 최저만 남긴다.
  const low = orderedPoints[lowLabelIdx];
  const high = orderedPoints[highLabelIdxRaw];
  const highLabelIdx =
    low && high && Math.abs(low.x - high.x) < 56 && Math.abs(low.y - high.y) < 16
      ? -1
      : highLabelIdxRaw;

  return (
    <div ref={boxRef} className="mt-4 w-full">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className={cn('h-auto w-full touch-pan-y', !hoverIsSelection && 'cursor-pointer')}
        role="img"
        aria-label="가격 추이 그래프"
        onMouseMove={(e) => {
          setHoverIdx(nearestIdxFromClientX(e.clientX));
          setHoverIsSelection(isCurrentSelection(targetAtClientX(e.clientX)));
        }}
        onMouseLeave={() => setHoverIdx(null)}
        onClick={(e) => selectAtClientX(e.clientX)}
      >
        <defs>
          <linearGradient id={`fill-${gradId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART.line} stopOpacity="0.16" />
            <stop offset="100%" stopColor={CHART.line} stopOpacity="0" />
          </linearGradient>
        </defs>

        {geo.ticks.map((t, i) => (
          <g key={i}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={t.y}
              y2={t.y}
              stroke="var(--color-gray-200)"
              strokeWidth={1}
            />
            <text
              x={pad.left - 8}
              y={t.y + 3}
              textAnchor="end"
              className="fill-gray-500"
              fontSize={11}
            >
              {shortWon(t.price, currency, geo.tickStep, geo.yMax)}
            </text>
          </g>
        ))}

        {/* 가이드는 하나만: 호버 중이면 호버, 아니면 선택/현재 */}
        {(() => {
          const guide =
            hoverIdx != null && orderedPoints[hoverIdx]
              ? { x: orderedPoints[hoverIdx].x, color: CHART.guide, dash: false }
              : selectedCoord
                ? { x: selectedCoord.x, color: CHART.guide, dash: false }
                : seedCoord
                  ? { x: seedCoord.x, color: CHART.currentGuide, dash: true }
                  : null;
          if (!guide) return null;
          return (
            <line
              x1={guide.x}
              x2={guide.x}
              y1={pad.top}
              y2={height - pad.bottom}
              stroke={guide.color}
              strokeWidth={1.5}
              strokeDasharray={guide.dash ? '4 3' : undefined}
            />
          );
        })()}

        {geo.d && orderedPoints.length > 0 && (
          <path
            d={`${geo.d} L ${orderedPoints[orderedPoints.length - 1].x} ${height - pad.bottom} L ${orderedPoints[0].x} ${height - pad.bottom} Z`}
            fill={`url(#fill-${gradId})`}
          />
        )}

        <path d={geo.d} fill="none" stroke={CHART.line} strokeWidth={2.5} strokeLinejoin="round" />

        {orderedPoints.map((c, i) => {
          // seed는 아래 전용 마커로만 그림 (이중 점 방지)
          if (currentMarker && isSeedDeal(c.deal, currentMarker.deal.id)) return null;

          const isLow = c.price === minPrice;
          const isHigh = c.price === maxPrice && maxPrice !== minPrice;
          const isHovered = i === hoverIdx;
          const isSelected = Boolean(selectedCoord && i === resolvedSelectedIdx);
          // 라벨은 최저/최고(각 한 번) + 호버/선택만 (기본 전부 숨김)
          const showPrice =
            (isLow && i === lowLabelIdx) ||
            (isHigh && i === highLabelIdx) ||
            isHovered ||
            isSelected;
          const stroke = isLow ? CHART.low : CHART.line;
          const labelFill = isLow ? CHART.low : isHigh ? CHART.high : chartVar('axis');

          return (
            <g key={`${c.date}-${i}`}>
              {showPrice && (
                <text
                  x={c.x}
                  y={c.y - 12}
                  textAnchor="middle"
                  fontSize={11}
                  stroke="var(--color-white)"
                  strokeWidth={3}
                  paintOrder="stroke"
                  fontWeight={isLow || isHigh ? 700 : 500}
                  fill={labelFill}
                >
                  {won(c.price, currency)}
                </text>
              )}
              <circle
                cx={c.x}
                cy={c.y}
                r={isSelected || isHovered ? 5.5 : 4}
                fill="var(--color-white)"
                stroke={stroke}
                strokeWidth={isSelected || isHovered ? 2.5 : 2}
              />
            </g>
          );
        })}

        {/* 이 상품 — 채운 점 + 라벨. 라벨은 위 여백(pad.top 위)에 고정 — 점 바로 위에 두면 이 상품이 최저가라 바닥에 있을 때
            내려오는 선·점과 겹쳤다(2026-10-15, 앱과 같은 자리). 점과는 기본 가이드 점선이 잇는다. */}
        {seedCoord && (
          <g>
            <text
              x={seedCoord.x}
              y={pad.top - 20}
              textAnchor="middle"
              fontSize={11}
              stroke="var(--color-white)"
              strokeWidth={3}
              paintOrder="stroke"
              fontWeight={700}
              fill={CHART.current}
            >
              이 상품
            </text>
            <text
              x={seedCoord.x}
              y={pad.top - 6}
              textAnchor="middle"
              fontSize={11}
              stroke="var(--color-white)"
              strokeWidth={3}
              paintOrder="stroke"
              fontWeight={600}
              fill={CHART.current}
            >
              {won(seedCoord.price, currency)}
            </text>
            <circle
              cx={seedCoord.x}
              cy={seedCoord.y}
              r={6.5}
              fill={CHART.current}
              stroke="var(--color-white)"
              strokeWidth={2}
            />
          </g>
        )}

        {geo.xLabels.map((label, i) => {
          const isToday = i === geo.xLabels.length - 1;
          return (
            <text
              key={i}
              x={label.x}
              y={height - 8}
              textAnchor={i === 0 ? 'start' : isToday ? 'end' : 'middle'}
              fontSize={11}
              fontWeight={isToday ? 600 : 400}
              className={isToday ? 'fill-gray-600' : 'fill-gray-500'}
            >
              {label.label}
            </text>
          );
        })}
      </svg>

      {selectedPoint && (
        <PriceHistoryDealPreview
          point={selectedPoint}
          currency={currency}
          isCurrent={viewingCurrent}
          linkable={isPreviewLinkable(viewingCurrent, selectedPoint.deal, productId)}
          onClick={() => onTrackClick('deal')}
        />
      )}
    </div>
  );
}
