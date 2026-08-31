/** curl / Cookie / JWT 원문 → 세시간전 refresh 쿠키 `r` 값만. */
export const parseThreeHaRefreshCookie = (raw: string): string | undefined => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;

  const fromCookieFlag =
    trimmed.match(/-(?:b|-cookie)\s+'([^']*)'/)?.[1] ??
    trimmed.match(/-(?:b|-cookie)\s+"([^"]*)"/)?.[1];
  const fromCookieHeader =
    trimmed.match(/-H\s+'[Cc]ookie:\s*([^']*)'/)?.[1] ??
    trimmed.match(/-H\s+"[Cc]ookie:\s*([^"]*)"/)?.[1];
  const blob = fromCookieFlag ?? fromCookieHeader ?? trimmed;
  const fromBlob = blob.match(/(?:^|[;\s])r=(eyJ[^;\s]+)/)?.[1];
  if (fromBlob) return fromBlob;

  if (trimmed.startsWith('eyJ') && trimmed.split('.').length === 3) return trimmed;
  return undefined;
};

export const threeHaSessionSummary = (jwt: string): string => `r=${jwt.length}자`;
