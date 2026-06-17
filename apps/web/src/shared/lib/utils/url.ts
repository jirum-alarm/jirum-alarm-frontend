/**
 * http/https 형식의 유효한 URL 인지 검사한다.
 * 빈 문자열은 false (필수/선택 판단은 호출부 책임).
 */
export function isHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}
