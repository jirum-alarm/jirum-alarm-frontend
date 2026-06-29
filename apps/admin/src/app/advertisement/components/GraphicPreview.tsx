'use client';

import { type CSSProperties, type PointerEvent, useMemo, useRef, useState } from 'react';

import {
  AdvertiseAsset,
  AdvertiseElementAsset,
  ElementConstraints,
  ElementLayoutSize,
  GraphicSize,
  ResponsiveAdvertiseGraphic,
  ResponsiveOverrideMap,
  ResponsiveValueMap,
} from '@/hooks/graphql/advertisement';

import { normalizeAssetUrl } from './assetUrl';

/**
 * 광고 graphic 렌더러 — 프론트 타입 스펙(ResponsiveAdvertiseGraphic)을 온전히 반영.
 * - ResponsiveValueMap: 실제 렌더 width에 매칭되는 breakpoint 중 가장 큰 것, 없으면 _default.
 * - 컨테이너 = size[bp]. element = layoutByWidth[bp]의 constraints(절대배치) + optional size(고정 크기 override).
 *   size override가 없는 축은 기본 wrap_content(designSize)이고, 양쪽 constraint가 모두 있으면 0dp처럼 stretch된다.
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
  const scan = (m?: ResponsiveValueMap<unknown> | ResponsiveOverrideMap<unknown>) => {
    if (!m) return;
    Object.keys(m).forEach((k) => {
      if (k === '_default' || parseBreakpoint(k)) set.add(k as VariantKey);
    });
  };
  scan(graphic.size);
  scan(graphic.background.assetByWidth);
  (graphic.foregroundElements ?? []).forEach((el) => {
    scan(el.layoutByWidth);
    scan(el.assetByWidth);
    scan(el.visibleByWidth);
  });
  return sortVariantKeys([...set]);
}

function resolveResponsiveEntry<T>(
  map: ResponsiveValueMap<T> | undefined,
  containerWidth: number,
): { key: VariantKey; value: T } | undefined {
  if (!map) return undefined;

  const matched = Object.keys(map)
    .map((key) => {
      const breakpoint = parseBreakpoint(key);
      return breakpoint ? { key: key as VariantKey, ...breakpoint } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        key: VariantKey;
        operator: '>=' | '<=';
        value: number;
      } => entry !== null,
    )
    .filter((entry) =>
      entry.operator === '>=' ? containerWidth >= entry.value : containerWidth <= entry.value,
    )
    .sort((a, b) => {
      if (a.operator !== b.operator) return a.operator === '>=' ? -1 : 1;
      return a.operator === '>=' ? b.value - a.value : a.value - b.value;
    })[0];

  if (matched) return { key: matched.key, value: map[matched.key] as T };
  return { key: '_default', value: map._default };
}

function resolveResponsiveOverride<T>(
  map: ResponsiveOverrideMap<T> | undefined,
  containerWidth: number,
): T | undefined {
  if (!map) return undefined;

  const matched = Object.keys(map)
    .map((key) => {
      const breakpoint = parseBreakpoint(key);
      return breakpoint ? { key: key as VariantKey, ...breakpoint } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        key: VariantKey;
        operator: '>=' | '<=';
        value: number;
      } => entry !== null,
    )
    .filter((entry) =>
      entry.operator === '>=' ? containerWidth >= entry.value : containerWidth <= entry.value,
    )
    .sort((a, b) => {
      if (a.operator !== b.operator) return a.operator === '>=' ? -1 : 1;
      return a.operator === '>=' ? b.value - a.value : a.value - b.value;
    })[0];

  if (matched) return map[matched.key];
  return map._default;
}

function resolveAssetUrl(asset: AdvertiseAsset, containerWidth: number) {
  return resolveResponsiveOverride(asset.assetByWidth, containerWidth) ?? asset.assetUrl;
}

function resolveElementVisibility(element: AdvertiseElementAsset, containerWidth: number) {
  return resolveResponsiveOverride(element.visibleByWidth, containerWidth) ?? true;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getSimulatorRange(graphic: ResponsiveAdvertiseGraphic) {
  const breakpointWidths = collectBreakpoints(graphic)
    .map(parseBreakpoint)
    .filter((breakpoint): breakpoint is { operator: '>=' | '<='; value: number } =>
      Boolean(breakpoint),
    )
    .map((breakpoint) => breakpoint.value);
  const designWidths = Object.values(graphic.size ?? {})
    .map((size) => size?.width)
    .filter((width): width is number => typeof width === 'number' && Number.isFinite(width));
  const maxKnownWidth = Math.max(...breakpointWidths, ...designWidths, graphic.size._default.width);

  return {
    min: 280,
    max: Math.max(1024, maxKnownWidth + 200),
  };
}

function getVariantCanvasSize(graphic: ResponsiveAdvertiseGraphic, variantKey: VariantKey) {
  const explicitSize = graphic.size[variantKey];
  if (explicitSize) return explicitSize;

  const breakpoint = parseBreakpoint(variantKey);
  if (!breakpoint) return graphic.size._default;

  return {
    width: breakpoint.value,
    height: graphic.size._default.height,
  };
}

function getElementFrameStyle({
  constraints,
  size,
  designSize,
  containerSize,
}: {
  constraints: ElementConstraints;
  size: ElementLayoutSize | undefined;
  designSize: GraphicSize;
  containerSize: GraphicSize;
}): CSSProperties {
  const hasHorizontalConstraints =
    constraints.left !== undefined && constraints.right !== undefined;
  const hasVerticalConstraints = constraints.top !== undefined && constraints.bottom !== undefined;
  const aspectRatio =
    designSize.width > 0 && designSize.height > 0 ? designSize.width / designSize.height : 1;
  const widthValue = size?.width;
  const heightValue = size?.height;
  const constrainedWidth =
    widthValue === null && hasHorizontalConstraints
      ? containerSize.width - constraints.left! - constraints.right!
      : undefined;
  const constrainedHeight =
    heightValue === null && hasVerticalConstraints
      ? containerSize.height - constraints.top! - constraints.bottom!
      : undefined;
  let width = typeof widthValue === 'number' ? widthValue : constrainedWidth;
  let height = typeof heightValue === 'number' ? heightValue : constrainedHeight;

  if (width === undefined && height === undefined) {
    width = designSize.width;
    height = designSize.height;
  } else {
    width ??= height! * aspectRatio;
    height ??= width / aspectRatio;
  }

  const frameWidth = Math.max(1, width);
  const frameHeight = Math.max(1, height);
  let left = 0;
  let top = 0;

  if (constraints.left !== undefined && constraints.right !== undefined) {
    left =
      constraints.left +
      (containerSize.width - constraints.left - constraints.right - frameWidth) / 2;
  } else if (constraints.left !== undefined) {
    left = constraints.left;
  } else if (constraints.right !== undefined) {
    left = containerSize.width - constraints.right - frameWidth;
  }

  if (constraints.top !== undefined && constraints.bottom !== undefined) {
    top =
      constraints.top +
      (containerSize.height - constraints.top - constraints.bottom - frameHeight) / 2;
  } else if (constraints.top !== undefined) {
    top = constraints.top;
  } else if (constraints.bottom !== undefined) {
    top = containerSize.height - constraints.bottom - frameHeight;
  }

  return {
    top,
    left,
    width: frameWidth,
    height: frameHeight,
  };
}

const GraphicPreview = ({ graphic }: { graphic: ResponsiveAdvertiseGraphic | null }) => {
  const breakpoints = useMemo(() => (graphic ? collectBreakpoints(graphic) : []), [graphic]);
  const [simulatorWidth, setSimulatorWidth] = useState(graphic?.size?._default.width ?? 320);

  if (!graphic?.size?._default || !graphic.background?.assetUrl) {
    return (
      <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-stroke text-sm text-bodydark2">
        배경 에셋을 업로드하고 graphic을 채우면 미리보기가 표시됩니다
      </div>
    );
  }

  const simulatorRange = getSimulatorRange(graphic);
  const safeSimulatorWidth = clamp(simulatorWidth, simulatorRange.min, simulatorRange.max);

  return (
    <div>
      <div className="mb-3">
        <p className="text-sm font-semibold text-black dark:text-white">Variant Preview</p>
        <p className="text-xs text-bodydark2">
          default와 render width variant를 동시에 렌더링합니다.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {breakpoints.map((variantKey) => (
          <GraphicPreviewCard key={variantKey} graphic={graphic} variantKey={variantKey} />
        ))}
      </div>
      <WidthSimulator
        graphic={graphic}
        width={safeSimulatorWidth}
        minWidth={simulatorRange.min}
        maxWidth={simulatorRange.max}
        onWidthChange={setSimulatorWidth}
      />
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
  const containerSize = getVariantCanvasSize(graphic, variantKey);
  const { width: cw, height: ch } = containerSize;
  const backgroundAssetUrl = resolveAssetUrl(graphic.background, cw);

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
      <div className="overflow-x-auto">
        <div
          className="relative overflow-hidden rounded-lg border border-stroke bg-gray-2 dark:border-strokedark"
          style={{ width: cw, height: ch }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={backgroundAssetUrl}
            src={normalizeAssetUrl(backgroundAssetUrl)}
            alt="background"
            className="absolute inset-0 h-full w-full object-fill"
          />
          {(graphic.foregroundElements ?? []).map((el, i) => {
            if (!resolveElementVisibility(el, cw)) return null;
            const elementAssetUrl = resolveAssetUrl(el, cw);
            if (!elementAssetUrl || !el.layoutByWidth) return null;
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
              <div key={`${i}-${elementAssetUrl}`} className="absolute" style={frameStyle}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={normalizeAssetUrl(elementAssetUrl)}
                  alt={`element-${i}`}
                  className="h-full w-full object-fill"
                />
              </div>
            );
          })}
          <div className="pointer-events-none absolute bottom-[8px] right-[8px] z-30 w-fit rounded-[8px] border border-white bg-[#667085]/60 px-[7px] py-[3px] text-xs font-medium leading-none text-white">
            AD
          </div>
        </div>
      </div>
    </div>
  );
}

function WidthSimulator({
  graphic,
  width,
  minWidth,
  maxWidth,
  onWidthChange,
}: {
  graphic: ResponsiveAdvertiseGraphic;
  width: number;
  minWidth: number;
  maxWidth: number;
  onWidthChange: (width: number) => void;
}) {
  const rulerRef = useRef<HTMLDivElement>(null);
  const sizeEntry = resolveResponsiveEntry(graphic.size, width);
  const containerSize = sizeEntry?.value ?? graphic.size._default;
  const activeVariantKey = sizeEntry?.key ?? '_default';

  const updateWidthFromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = rulerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextWidth = Math.round(event.clientX - rect.left);
    onWidthChange(clamp(nextWidth, minWidth, maxWidth));
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    updateWidthFromPointer(event);
  };

  return (
    <section className="mt-4 rounded-lg border border-stroke p-3 dark:border-strokedark">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-black dark:text-white">Width Simulator</p>
          <p className="text-xs text-bodydark2">
            핸들을 드래그해서 실제 컨테이너 width를 바꿉니다.
          </p>
        </div>
        <div className="text-right text-xs text-bodydark2">
          <p className="font-semibold text-black dark:text-white">{width}px</p>
          <p>
            {labelVariant(activeVariantKey)} · {containerSize.width}×{containerSize.height}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-stroke bg-gray-2 p-3 dark:border-strokedark dark:bg-form-input">
        <div
          ref={rulerRef}
          className="relative min-h-12 border-t border-dashed border-bodydark2/40"
          style={{ width: maxWidth + 16 }}
          onPointerDown={handlePointerDown}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
              updateWidthFromPointer(event);
            }
          }}
        >
          <div
            className="relative bg-white shadow-sm dark:bg-boxdark"
            style={{ width, height: containerSize.height }}
          >
            <SimulatedGraphic graphic={graphic} containerSize={containerSize} width={width} />
            <div
              role="slider"
              aria-label="preview width"
              aria-valuemin={minWidth}
              aria-valuemax={maxWidth}
              aria-valuenow={width}
              tabIndex={0}
              className="absolute left-full top-0 z-40 h-full w-4 cursor-ew-resize touch-none rounded-r border border-primary bg-primary/15 outline-none ring-primary focus:ring-2"
              onPointerDown={handlePointerDown}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  updateWidthFromPointer(event);
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowLeft') onWidthChange(clamp(width - 1, minWidth, maxWidth));
                if (event.key === 'ArrowRight') onWidthChange(clamp(width + 1, minWidth, maxWidth));
              }}
            >
              <span className="absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded bg-primary" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SimulatedGraphic({
  graphic,
  containerSize,
  width,
}: {
  graphic: ResponsiveAdvertiseGraphic;
  containerSize: GraphicSize;
  width: number;
}) {
  const backgroundAssetUrl = resolveAssetUrl(graphic.background, width);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-lg border border-stroke bg-gray-2 dark:border-strokedark">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={backgroundAssetUrl}
        src={normalizeAssetUrl(backgroundAssetUrl)}
        alt="background"
        className="absolute inset-0 h-full w-full object-fill"
      />
      {(graphic.foregroundElements ?? []).map((el, i) => {
        if (!resolveElementVisibility(el, width)) return null;
        const elementAssetUrl = resolveAssetUrl(el, width);
        if (!elementAssetUrl || !el.layoutByWidth) return null;
        const layout =
          resolveResponsiveEntry(el.layoutByWidth, width)?.value ?? el.layoutByWidth._default;
        if (!layout) return null;
        const frameStyle = getElementFrameStyle({
          constraints: layout.constraints ?? {},
          size: layout.size,
          designSize: el.designSize,
          containerSize: { width, height: containerSize.height },
        });
        return (
          <div key={`${i}-${elementAssetUrl}`} className="absolute" style={frameStyle}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={normalizeAssetUrl(elementAssetUrl)}
              alt={`element-${i}`}
              className="h-full w-full object-fill"
            />
          </div>
        );
      })}
      <div className="pointer-events-none absolute bottom-[8px] right-[8px] z-30 w-fit rounded-[8px] border border-white bg-[#667085]/60 px-[7px] py-[3px] text-xs font-medium leading-none text-white">
        AD
      </div>
    </div>
  );
}

export default GraphicPreview;
