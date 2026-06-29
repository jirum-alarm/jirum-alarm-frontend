'use client';

import { type CSSProperties, useMemo } from 'react';

import {
  ElementConstraints,
  GraphicSize,
  ResponsiveAdvertiseGraphic,
  ResponsiveValueMap,
} from '@/hooks/graphql/advertisement';

import { normalizeAssetUrl } from './assetUrl';

/**
 * 광고 graphic 렌더러 — 프론트 타입 스펙(ResponsiveAdvertiseGraphic)을 온전히 반영.
 * - ResponsiveValueMap: 선택 폭(viewport) 이하의 breakpoint 중 가장 큰 것, 없으면 _default.
 * - 컨테이너 = size[bp]. element = layoutByWidth[bp]의 constraints(절대배치) + optional size(크기 override).
 *   모든 좌표/크기는 해당 breakpoint의 컨테이너 size 좌표계(px) → 컨테이너 대비 %로 환산.
 * - 실서비스 web 렌더러가 생기면 이 컴포넌트를 그대로 공유(packages화) 가능.
 */

type VariantKey = '_default' | `${'>=' | '<='}${number}`;

const parseBreakpoint = (key: string) => {
  const match = /^(>=|<=)(\d+)$/.exec(key);
  return match ? { operator: match[1] as '>=' | '<=', value: Number(match[2]) } : null;
};

const sortVariantKeys = (keys: VariantKey[]) =>
  [...keys].sort((a, b) => {
    if (a === '_default') return -1;
    if (b === '_default') return 1;
    const breakpointA = parseBreakpoint(a);
    const breakpointB = parseBreakpoint(b);
    if (!breakpointA || !breakpointB) return a.localeCompare(b);
    if (breakpointA.operator !== breakpointB.operator)
      return breakpointA.operator === '>=' ? -1 : 1;
    return breakpointA.value - breakpointB.value;
  });

const labelVariant = (key: VariantKey) => (key === '_default' ? 'default (else/base)' : key);

// graphic에 정의된 모든 variant 키 수집 (_default + >=N/<=N). 신규 DSL은 >=N 중심이다.
function collectBreakpoints(graphic: ResponsiveAdvertiseGraphic): VariantKey[] {
  const set = new Set<VariantKey>(['_default']);
  const scan = (m?: ResponsiveValueMap<unknown>) => {
    if (!m) return;
    Object.keys(m).forEach((k) => {
      if (k === '_default' || parseBreakpoint(k)) set.add(k as VariantKey);
    });
  };
  scan(graphic.size);
  (graphic.foregroundElements ?? []).forEach((el) => scan(el.layoutByWidth));
  return sortVariantKeys([...set]);
}

const pct = (v: number, base: number) => `${(v / base) * 100}%`;

function getElementFrameStyle({
  constraints,
  size,
  designSize,
  containerSize,
}: {
  constraints: ElementConstraints;
  size: Partial<GraphicSize> | undefined;
  designSize: GraphicSize;
  containerSize: GraphicSize;
}): CSSProperties {
  const { width: cw, height: ch } = containerSize;
  const isWidthStretched = constraints.left !== undefined && constraints.right !== undefined;
  const isHeightStretched = constraints.top !== undefined && constraints.bottom !== undefined;

  return {
    top: constraints.top !== undefined ? pct(constraints.top, ch) : undefined,
    left: constraints.left !== undefined ? pct(constraints.left, cw) : undefined,
    bottom: constraints.bottom !== undefined ? pct(constraints.bottom, ch) : undefined,
    right: constraints.right !== undefined ? pct(constraints.right, cw) : undefined,
    width:
      size?.width !== undefined
        ? pct(size.width, cw)
        : isWidthStretched
          ? undefined
          : pct(designSize.width, cw),
    height:
      size?.height !== undefined
        ? pct(size.height, ch)
        : isHeightStretched
          ? undefined
          : pct(designSize.height, ch),
  };
}

const GraphicPreview = ({ graphic }: { graphic: ResponsiveAdvertiseGraphic | null }) => {
  const breakpoints = useMemo(() => (graphic ? collectBreakpoints(graphic) : []), [graphic]);

  if (!graphic?.size?._default || !graphic.background?.assetUrl) {
    return (
      <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-stroke text-sm text-bodydark2">
        배경 에셋을 업로드하고 graphic을 채우면 미리보기가 표시됩니다
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-semibold text-black dark:text-white">Variant Preview</p>
        <p className="text-xs text-bodydark2">default와 기기 size variant를 동시에 렌더링합니다.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {breakpoints.map((variantKey) => (
          <GraphicPreviewCard key={variantKey} graphic={graphic} variantKey={variantKey} />
        ))}
      </div>
    </div>
  );
};

function GraphicPreviewCard({
  graphic,
  variantKey,
}: {
  graphic: ResponsiveAdvertiseGraphic;
  variantKey: VariantKey;
}) {
  const containerSize: GraphicSize = graphic.size[variantKey] ?? graphic.size._default;
  const { width: cw, height: ch } = containerSize;
  const aspect = ch / cw;

  return (
    <div className="rounded-lg border border-stroke p-3 dark:border-strokedark">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-black dark:text-white">
          {labelVariant(variantKey)}
        </span>
        <span className="text-xs text-bodydark2">
          {cw}×{ch}
        </span>
      </div>
      <div className="w-full" style={{ maxWidth: `${cw}px` }}>
        <div
          className="relative w-full overflow-hidden rounded-lg border border-stroke bg-gray-2 dark:border-strokedark"
          style={{ paddingBottom: `${aspect * 100}%` }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={graphic.background.assetUrl}
            src={normalizeAssetUrl(graphic.background.assetUrl)}
            alt="background"
            className="absolute inset-0 h-full w-full object-fill"
          />
          {(graphic.foregroundElements ?? []).map((el, i) => {
            if (!el?.assetUrl || !el.layoutByWidth) return null;
            const layout = el.layoutByWidth[variantKey] ?? el.layoutByWidth._default;
            if (!layout) return null;
            const c: ElementConstraints = layout.constraints ?? {};
            const frameStyle = getElementFrameStyle({
              constraints: c,
              size: layout.size,
              designSize: el.designSize,
              containerSize,
            });
            return (
              <div key={`${i}-${el.assetUrl}`} className="absolute" style={frameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizeAssetUrl(el.assetUrl)}
                  alt={`element-${i}`}
                  className="h-full w-full object-contain"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default GraphicPreview;
