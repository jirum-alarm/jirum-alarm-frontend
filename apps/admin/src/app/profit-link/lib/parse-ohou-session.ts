export type ParsedOhouSession = {
  cookie: string;
  userId: number;
  contentId?: number;
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

const positiveInt = (value: unknown): number | undefined => {
  const n = typeof value === 'number' ? value : Number(String(value ?? ''));
  if (!Number.isFinite(n) || n <= 0) return undefined;
  return Math.trunc(n);
};

/** curl / JSON → 큐레이터 세션. userId 없는 익명 공유는 undefined. */
export const parseOhouSession = (raw: string): ParsedOhouSession | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  try {
    const j = JSON.parse(trimmed) as { cookie?: unknown; userId?: unknown; contentId?: unknown };
    const userId = positiveInt(j?.userId);
    if (typeof j?.cookie === 'string' && j.cookie.trim() && userId) {
      return {
        cookie: j.cookie.trim(),
        userId,
        contentId: positiveInt(j.contentId),
      };
    }
  } catch {
    /* curl */
  }

  const cookie = extractCurlCookie(trimmed);
  const body = extractCurlJsonBody(trimmed);
  const userId = positiveInt(body?.userId);
  const contentId =
    positiveInt(body?.contentId) ?? positiveInt(trimmed.match(/\/goods\/(\d+)/)?.[1]);

  if (!cookie || !userId) return undefined;
  return { cookie, userId, contentId };
};
