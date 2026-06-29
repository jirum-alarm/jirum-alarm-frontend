import type { ActiveAdsQuery } from '@/shared/api/gql/graphql';

export type AdvertiseCreative = ActiveAdsQuery['activeAds'][number];

export interface GraphicSize {
  width: number;
  height: number;
}

export type ElementLayoutSize = Partial<Record<keyof GraphicSize, number | null>>;

export interface ElementConstraints {
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
}

export type ResponsiveValueMap<T> = {
  _default: T;
} & Partial<Record<`${'>=' | '<='}${number}`, T>>;

export interface AdvertiseAsset {
  designSize: GraphicSize;
  assetUrl: string;
}

export type AdvertiseElementAsset = AdvertiseAsset & {
  layoutByWidth: ResponsiveValueMap<{
    constraints: ElementConstraints;
    size?: ElementLayoutSize;
  }>;
};

export interface ResponsiveAdvertiseGraphic {
  size: ResponsiveValueMap<GraphicSize>;
  background: AdvertiseAsset;
  foregroundElements: AdvertiseElementAsset[];
}

const breakpointPattern = /^(>=|<=)(\d+)$/;

function parseBreakpoint(key: string) {
  const match = breakpointPattern.exec(key);
  if (!match) return null;
  return { key, operator: match[1] as '>=' | '<=', value: Number(match[2]) };
}

export function resolveResponsiveValue<T>(
  map: ResponsiveValueMap<T> | undefined,
  containerWidth: number,
): T | undefined {
  if (!map) return undefined;

  const matched = Object.keys(map)
    .map(parseBreakpoint)
    .filter(
      (entry): entry is { key: string; operator: '>=' | '<='; value: number } => entry !== null,
    )
    .filter((entry) =>
      entry.operator === '>=' ? containerWidth >= entry.value : containerWidth <= entry.value,
    )
    .sort((a, b) => {
      if (a.operator !== b.operator) return a.operator === '>=' ? -1 : 1;
      return a.operator === '>=' ? b.value - a.value : a.value - b.value;
    })[0];

  return matched ? map[matched.key as `${'>=' | '<='}${number}`] : map._default;
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isGraphicSize(value: unknown): value is GraphicSize {
  if (!value || typeof value !== 'object') return false;
  const target = value as GraphicSize;
  return isNumber(target.width) && isNumber(target.height) && target.width > 0 && target.height > 0;
}

export function parseAdvertiseGraphic(value: unknown): ResponsiveAdvertiseGraphic | null {
  if (!value || typeof value !== 'object') return null;
  const graphic = value as Partial<ResponsiveAdvertiseGraphic>;
  if (!graphic.size?._default || !isGraphicSize(graphic.size._default)) return null;
  if (!graphic.background?.assetUrl) return null;

  return {
    size: graphic.size,
    background: graphic.background,
    foregroundElements: Array.isArray(graphic.foregroundElements) ? graphic.foregroundElements : [],
  };
}

export function normalizeAdvertiseAssetUrl(source: string) {
  try {
    const url = new URL(source);
    url.pathname = url.pathname
      .split('/')
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join('/');
    return url.toString();
  } catch {
    return source.replace(/\+/g, '%2B');
  }
}
