const TBIZAUTH_COOKIE_RE = /(?:^|[;\s])TBIZAUTH=([^;\s]+)/gi;

const extractTbizAuthFromCookieBlob = (blob: string): string | undefined => {
  const matches = [...blob.matchAll(TBIZAUTH_COOKIE_RE)];
  const raw = matches.at(-1)?.[1]?.trim();
  if (!raw) return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

/** curl / Cookie 헤더 / 원문 → TBIZAUTH 값만. 없으면 undefined. */
export const parseTossTbizAuth = (raw: string): string | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const fromCookieFlag =
    trimmed.match(/-(?:b|-cookie)\s+'([^']*)'/)?.[1] ??
    trimmed.match(/-(?:b|-cookie)\s+"([^"]*)"/)?.[1];
  if (fromCookieFlag) return extractTbizAuthFromCookieBlob(fromCookieFlag);

  const fromCookieHeader =
    trimmed.match(/-H\s+'[Cc]ookie:\s*([^']*)'/)?.[1] ??
    trimmed.match(/-H\s+"[Cc]ookie:\s*([^"]*)"/)?.[1];
  if (fromCookieHeader) return extractTbizAuthFromCookieBlob(fromCookieHeader);

  const fromBlob = extractTbizAuthFromCookieBlob(trimmed);
  if (fromBlob) return fromBlob;

  if (trimmed.startsWith('curl') || /[\s;]/.test(trimmed)) return undefined;
  return trimmed;
};
