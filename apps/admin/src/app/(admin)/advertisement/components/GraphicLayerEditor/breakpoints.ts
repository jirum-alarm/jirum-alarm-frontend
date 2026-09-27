import {
  AdvertiseAsset,
  AdvertiseElementAsset,
  ResponsiveAdvertiseGraphic,
  ResponsiveOverrideMap,
} from '@/hooks/graphql/advertisement';

// render width variant 키('_default' | '>=456' 등)를 다루는 순수 함수들.
export type BreakpointKey = '_default' | `${'>=' | '<='}${number}`;
export const DEFAULT_RENDER_WIDTH_BREAKPOINT = 456;

export const parseBreakpoint = (key: string) => {
  const match = /^(>=|<=)(\d+)$/.exec(key);
  return match ? { operator: match[1] as '>=' | '<=', value: Number(match[2]) } : null;
};

const sortBreakpointKeys = (keys: BreakpointKey[]) =>
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

export const labelBreakpoint = (key: BreakpointKey) =>
  key === '_default' ? 'default (else/base)' : key;

export function getBreakpointKeys(graphic: ResponsiveAdvertiseGraphic): BreakpointKey[] {
  const keys = new Set<BreakpointKey>(['_default']);

  Object.keys(graphic.size ?? {}).forEach((key) => keys.add(key as BreakpointKey));
  Object.keys(graphic.background.assetByWidth ?? {}).forEach((key) =>
    keys.add(key as BreakpointKey),
  );
  graphic.foregroundElements.forEach((element) => {
    Object.keys(element.layoutByWidth ?? {}).forEach((key) => keys.add(key as BreakpointKey));
    Object.keys(element.assetByWidth ?? {}).forEach((key) => keys.add(key as BreakpointKey));
    Object.keys(element.visibleByWidth ?? {}).forEach((key) => keys.add(key as BreakpointKey));
  });

  return sortBreakpointKeys([...keys]);
}

function resolveResponsiveOverride<T>(
  map: ResponsiveOverrideMap<T> | undefined,
  canvasWidth: number,
): T | undefined {
  if (!map) return undefined;

  const matched = Object.keys(map)
    .map((key) => {
      const breakpoint = parseBreakpoint(key);
      return breakpoint ? { key: key as BreakpointKey, ...breakpoint } : null;
    })
    .filter(
      (
        entry,
      ): entry is {
        key: BreakpointKey;
        operator: '>=' | '<=';
        value: number;
      } => entry !== null,
    )
    .filter((entry) =>
      entry.operator === '>=' ? canvasWidth >= entry.value : canvasWidth <= entry.value,
    )
    .sort((a, b) => {
      if (a.operator !== b.operator) return a.operator === '>=' ? -1 : 1;
      return a.operator === '>=' ? b.value - a.value : a.value - b.value;
    })[0];

  if (matched) return map[matched.key];
  return map._default;
}

export function resolveAssetUrl(asset: AdvertiseAsset, canvasWidth: number) {
  return resolveResponsiveOverride(asset.assetByWidth, canvasWidth) ?? asset.assetUrl;
}

export function resolveElementVisibility(element: AdvertiseElementAsset, canvasWidth: number) {
  return resolveResponsiveOverride(element.visibleByWidth, canvasWidth) ?? true;
}

export function setOverride<T>(
  map: ResponsiveOverrideMap<T> | undefined,
  breakpoint: BreakpointKey,
  value: T,
) {
  return {
    ...(map ?? {}),
    [breakpoint]: value,
  };
}

export function removeOverride<T>(
  map: ResponsiveOverrideMap<T> | undefined,
  breakpoint: BreakpointKey,
) {
  const { [breakpoint]: _, ...next } = map ?? {};
  return Object.keys(next).length > 0 ? next : undefined;
}

export function renameResponsiveKey<T extends Partial<Record<BreakpointKey, unknown>>>(
  map: T | undefined,
  from: BreakpointKey,
  to: BreakpointKey,
) {
  if (!map || from === to || !(from in map)) return map;

  const { [from]: value, ...rest } = map;
  return {
    ...rest,
    [to]: value,
  } as T;
}

export function getVariantCanvasSize(
  graphic: ResponsiveAdvertiseGraphic,
  breakpointKey: BreakpointKey,
) {
  const explicitSize = graphic.size[breakpointKey];
  if (explicitSize) return explicitSize;

  const breakpoint = parseBreakpoint(breakpointKey);
  if (!breakpoint) return graphic.size._default;

  return {
    width: breakpoint.value,
    height: graphic.size._default.height,
  };
}
