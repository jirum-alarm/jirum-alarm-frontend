'use client';

import { useMemo, useState } from 'react';

import {
  ElementConstraints,
  GraphicSize,
  ResponsiveAdvertiseGraphic,
  ResponsiveValueMap,
} from '@/hooks/graphql/advertisement';

/**
 * 광고 graphic 렌더러 — 프론트 타입 스펙(ResponsiveAdvertiseGraphic)을 온전히 반영.
 * - ResponsiveValueMap: 선택 폭(viewport) 이하의 breakpoint 중 가장 큰 것, 없으면 _default.
 * - 컨테이너 = size[bp]. element = layoutByWidth[bp]의 constraints(절대배치) + size(크기).
 *   모든 좌표/크기는 해당 breakpoint의 컨테이너 size 좌표계(px) → 컨테이너 대비 %로 환산.
 * - 실서비스 web 렌더러가 생기면 이 컴포넌트를 그대로 공유(packages화) 가능.
 */

// "<=768" 같은 키에서 768 추출
const bpNum = (key: string): number | null => {
  const m = /^<=(\d+)$/.exec(key);
  return m ? Number(m[1]) : null;
};

// ResponsiveValueMap 조회: viewport 이하 breakpoint 중 가장 큰 값, 없으면 _default.
function resolveResponsive<T>(map: ResponsiveValueMap<T>, viewport: number): T {
  if (!map) return undefined as unknown as T;
  const candidates = Object.keys(map)
    .map((k) => ({ k, n: bpNum(k) }))
    .filter((x): x is { k: string; n: number } => x.n !== null && viewport <= x.n)
    .sort((a, b) => a.n - b.n); // 가장 작은(가장 타이트한) 매칭 우선
  if (candidates.length > 0) return map[candidates[0].k as `<=${number}`] as T;
  return map._default;
}

// graphic에 정의된 모든 breakpoint 키 수집 (_default + <=N), 토글 옵션용
function collectBreakpoints(
  graphic: ResponsiveAdvertiseGraphic,
): { label: string; viewport: number }[] {
  const set = new Set<number>();
  const scan = (m?: ResponsiveValueMap<unknown>) => {
    if (!m) return;
    Object.keys(m).forEach((k) => {
      const n = bpNum(k);
      if (n !== null) set.add(n);
    });
  };
  scan(graphic.size);
  (graphic.foregroundElements ?? []).forEach((el) => scan(el.layoutByWidth));
  // _default는 "가장 넓은 화면"(큰 viewport)로 표현
  const opts = [...set].sort((a, b) => a - b).map((n) => ({ label: `≤${n}px`, viewport: n }));
  return [{ label: 'default (wide)', viewport: Number.MAX_SAFE_INTEGER }, ...opts];
}

const pct = (v: number, base: number) => `${(v / base) * 100}%`;

const GraphicPreview = ({ graphic }: { graphic: ResponsiveAdvertiseGraphic | null }) => {
  const breakpoints = useMemo(() => (graphic ? collectBreakpoints(graphic) : []), [graphic]);
  const [vpIdx, setVpIdx] = useState(0);

  if (!graphic?.size?._default || !graphic.background?.assetUrl) {
    return (
      <div className="flex h-60 items-center justify-center rounded-lg border border-dashed border-stroke text-sm text-bodydark2">
        배경 에셋을 업로드하고 graphic을 채우면 미리보기가 표시됩니다
      </div>
    );
  }

  const viewport =
    breakpoints[Math.min(vpIdx, breakpoints.length - 1)]?.viewport ?? Number.MAX_SAFE_INTEGER;
  const containerSize: GraphicSize =
    resolveResponsive(graphic.size, viewport) ?? graphic.size._default;
  const { width: cw, height: ch } = containerSize;
  const aspect = ch / cw;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2">
        <span className="text-xs text-bodydark2">미리보기</span>
        {breakpoints.length > 1 && (
          <select
            className="rounded border border-stroke bg-transparent px-2 py-1 text-xs dark:border-strokedark dark:bg-form-input"
            value={vpIdx}
            onChange={(e) => setVpIdx(Number(e.target.value))}
          >
            {breakpoints.map((b, i) => (
              <option key={b.label} value={i}>
                {b.label}
              </option>
            ))}
          </select>
        )}
        <span className="text-xs text-bodydark2">
          {cw}×{ch}
        </span>
      </div>
      {/* 선택 breakpoint의 실제 컨테이너 폭(cw)으로 제한해 "그 폭에서의 모습"을 보여줌.
          default(wide)는 cw가 클 수 있어 부모 폭까지만(w-full+maxWidth). 좁은 bp는 그 픽셀폭으로. */}
      <div className="w-full" style={{ maxWidth: `${cw}px` }}>
        <div
          className="relative w-full overflow-hidden rounded-lg border border-stroke bg-gray-2 dark:border-strokedark"
          style={{ paddingBottom: `${aspect * 100}%` }}
        >
          {/* key에 assetUrl 포함 → src 교체 시 새 노드로 리마운트(이전 이미지 잔존 방지) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={graphic.background.assetUrl}
            src={graphic.background.assetUrl}
            alt="background"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {(graphic.foregroundElements ?? []).map((el, i) => {
            if (!el?.assetUrl || !el.layoutByWidth) return null;
            const layout = resolveResponsive(el.layoutByWidth, viewport);
            if (!layout) return null;
            const c: ElementConstraints = layout.constraints ?? {};
            const sz: GraphicSize | undefined = layout.size;
            return (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${i}-${el.assetUrl}`}
                src={el.assetUrl}
                alt={`element-${i}`}
                className="absolute"
                style={{
                  top: c.top !== undefined ? pct(c.top, ch) : undefined,
                  left: c.left !== undefined ? pct(c.left, cw) : undefined,
                  bottom: c.bottom !== undefined ? pct(c.bottom, ch) : undefined,
                  right: c.right !== undefined ? pct(c.right, cw) : undefined,
                  width: sz?.width !== undefined ? pct(sz.width, cw) : undefined,
                  height: sz?.height !== undefined ? pct(sz.height, ch) : undefined,
                  objectFit: 'contain',
                }}
              />
            );
          })}
        </div>
      </div>
      <p className="mt-1 text-xs text-bodydark2">
        ※ 선택한 폭({cw}px)에서의 레이아웃. 실제 렌더는 프론트 광고 컴포넌트 기준 — 검수용.
      </p>
    </div>
  );
};

export default GraphicPreview;
