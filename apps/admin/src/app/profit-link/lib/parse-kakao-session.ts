export type ParsedKakaoSession = {
  cookie: string;
  productId?: string;
};

const quoted = (flag: string, input: string): string | undefined =>
  input.match(new RegExp(`${flag}\\s+'([^']*)'`))?.[1] ??
  input.match(new RegExp(`${flag}\\s+"([^"]*)"`))?.[1];

const extractCurlCookie = (raw: string): string | undefined => {
  const fromFlag = quoted('-(?:b|-cookie)', raw) ?? quoted('--cookie', raw);
  if (fromFlag) return fromFlag.trim();

  const fromHeader =
    raw.match(/-H\s+'[Cc]ookie:\s*([^']*)'/)?.[1] ?? raw.match(/-H\s+"[Cc]ookie:\s*([^"]*)"/)?.[1];
  if (fromHeader) return fromHeader.trim();

  return undefined;
};

const extractCurlJsonBody = (raw: string): Record<string, unknown> | undefined => {
  const blob =
    quoted('--data-raw', raw) ??
    quoted('--data-binary', raw) ??
    quoted('--data', raw) ??
    quoted('\\s-d', raw);
  if (!blob) return undefined;
  try {
    const parsed = JSON.parse(blob) as unknown;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return undefined;
  }
  return undefined;
};

export const extractKakaoProductId = (raw: string): string | undefined => {
  const fromPath = raw.match(/\/products\/(\d+)/)?.[1];
  if (fromPath) return fromPath;
  const fromBody = raw.match(/"shareTargetId"\s*:\s*"(\d+)"/)?.[1];
  if (fromBody) return fromBody;
  if (/^\d+$/.test(raw.trim())) return raw.trim();
  return undefined;
};

const looksLikeKakaoShoppingCookie = (cookie: string): boolean =>
  /(?:^|[;\s])(_kawlt|_kau|_T_ANO|_kakaoshopping_token_|_kahai)=/.test(cookie);

/** curl / Cookie / JSON → 카카오쇼핑 세션. 세션 마커 없으면 undefined. */
export const parseKakaoSession = (raw: string): ParsedKakaoSession | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    const j = JSON.parse(trimmed) as { cookie?: unknown; productId?: unknown };
    if (
      typeof j?.cookie === 'string' &&
      j.cookie.trim() &&
      looksLikeKakaoShoppingCookie(j.cookie)
    ) {
      const productId =
        typeof j.productId === 'string' || typeof j.productId === 'number'
          ? extractKakaoProductId(String(j.productId))
          : undefined;
      return { cookie: j.cookie.trim(), productId };
    }
  } catch {
    /* curl */
  }

  const cookie =
    extractCurlCookie(trimmed) ?? (looksLikeKakaoShoppingCookie(trimmed) ? trimmed : undefined);
  if (!cookie || !looksLikeKakaoShoppingCookie(cookie)) return undefined;

  const body = extractCurlJsonBody(trimmed);
  const productId =
    extractKakaoProductId(String(body?.shareTargetId ?? '')) ?? extractKakaoProductId(trimmed);

  return { cookie, productId };
};

export const kakaoSessionSummary = (parsed: ParsedKakaoSession): string =>
  parsed.productId
    ? `productId=${parsed.productId} cookie=${parsed.cookie.length}자`
    : `cookie=${parsed.cookie.length}자`;
