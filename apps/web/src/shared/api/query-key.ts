type Primitive = string | number | boolean | null;
type NormalizedRecord = { [key: string]: Primitive | NormalizedArray | NormalizedRecord };
type NormalizedArray = Array<Primitive | NormalizedArray | NormalizedRecord>;
type Normalized = Primitive | NormalizedArray | NormalizedRecord;

const normalize = (value: unknown): Normalized | undefined => {
  if (value === undefined) {
    return undefined;
  }
  if (value === null || typeof value !== 'object') {
    return value as Primitive;
  }
  if (Array.isArray(value)) {
    return value.map(normalize).filter((v): v is Normalized => v !== undefined);
  }

  const entries: Array<[string, Normalized]> = Object.entries(
    value as Record<string, unknown>,
  ).flatMap(([k, v]) => {
    const normalizedValue = normalize(v);
    return normalizedValue === undefined ? [] : [[k, normalizedValue]];
  });

  entries.sort(([a], [b]) => a.localeCompare(b));

  return Object.fromEntries(entries) as Record<string, Normalized>;
};

/**
 * queryKey 헬퍼: 도메인/스코프/파라미터를 안정적으로 직렬화해 충돌을 방지합니다.
 */
export const buildQueryKey = (
  domain: string,
  ...segments: Array<string | Record<string, unknown> | undefined>
) => {
  const normalizedSegments = segments
    .map((segment) => (typeof segment === 'object' ? normalize(segment) : segment))
    .filter((segment) => {
      if (segment === undefined) return false;
      if (typeof segment === 'string') return true;
      return Object.keys(segment as Record<string, unknown>).length > 0;
    });

  return [domain, ...normalizedSegments];
};
