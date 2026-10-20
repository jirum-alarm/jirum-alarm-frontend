import {isCancelledError} from '@tanstack/react-query';
import {FetchError} from '@/shared/lib/client';

// 정상 흐름이라 보내지 않는 서버 응답 — 인증 만료(갱신·로그아웃이 처리)와 지워진 글·상품.
const EXPECTED_CODES = new Set<number | string>([
  401,
  403,
  404,
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
]);

/**
 * 이 실패를 Sentry 에 보낼지, 보낸다면 묶을 키(`원인|쿼리이름|메시지`)를 돌려준다. 보내지 않으면 null.
 *
 * - 네트워크 끊김: fetch 가 `TypeError: Network request failed` 를 던진다 — 지하철에서 늘 나는 일.
 * - 취소: 화면을 떠나 react-query 가 끊은 요청.
 * - 인증·없는 글: 앱이 이미 처리하는 응답.
 * 나머지(서버 오류·HTML 502·GraphQL 검증 실패·queryFn 가공 중 예외)는 우리가 고칠 일이라 보낸다.
 */
export function queryErrorReportKey(
  error: unknown,
  source: {kind: 'query' | 'mutation'; key: unknown},
): string | null {
  if (isCancelledError(error)) return null;
  if (isOfflineError(error)) return null;
  if (error instanceof FetchError && error.code != null) {
    if (EXPECTED_CODES.has(error.code)) return null;
  }

  const kind =
    error instanceof FetchError
      ? `graphql:${String(error.code ?? 'none')}`
      : error instanceof Error
      ? error.name
      : 'non-error';
  const message = error instanceof Error ? error.message : String(error);
  return `${kind}|${source.kind}:${queryName(source.key)}|${message.slice(
    0,
    120,
  )}`;
}

/**
 * 기기가 오프라인이라 난 실패 — 고칠 게 없다. fetch 는 `TypeError: Network request failed`,
 * expo-updates·Firebase 는 메시지에 network·offline·timed out 을 담는다.
 */
export function isOfflineError(error: unknown): boolean {
  if (error instanceof TypeError && /network request/i.test(error.message)) {
    return true;
  }
  const message = error instanceof Error ? error.message : '';
  return (
    /\b(network|offline|internet|timed out)\b/i.test(message) &&
    !(error instanceof FetchError)
  );
}

/** 쿼리 키의 첫 칸 — 이 레포의 키는 `['product', …]` 처럼 도메인 이름으로 시작한다. */
export function queryName(key: unknown): string {
  return Array.isArray(key) ? String(key[0] ?? 'unknown') : 'unknown';
}
