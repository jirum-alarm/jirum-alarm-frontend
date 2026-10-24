import {isCancelledError} from '@tanstack/react-query';
import {FetchError, HttpStatusError} from '@/shared/lib/client';

// 정상 흐름이라 보내지 않는 서버 응답 — 인증 만료(갱신·로그아웃이 처리)와 지워진 글·상품.
const EXPECTED_CODES = new Set<number | string>([
  401,
  403,
  404,
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'NOT_FOUND',
]);

// 뮤테이션의 400 은 서버가 사용자 입력을 거절한 것(「이미 등록된 키워드」·「최대 20개」) — 화면이 그 말을
// 토스트로 보여 주는 정상 흐름이다. 조회의 400 은 앱이 잘못된 변수를 보낸 것이라 그대로 보낸다.
const USER_INPUT_CODES = new Set<number | string>([
  400,
  'BAD_REQUEST',
  'BAD_USER_INPUT',
]);

/**
 * 이 실패를 Sentry 에 보낼지, 보낸다면 묶을 키(`원인|쿼리이름|메시지`)를 돌려준다. 보내지 않으면 null.
 *
 * - 네트워크 끊김: fetch 가 `TypeError: Network request failed` 를 던진다 — 지하철에서 늘 나는 일.
 * - 취소: 화면을 떠나 react-query 가 끊은 요청.
 * - 인증·없는 글·뮤테이션 입력 거절: 앱이 이미 처리하는 응답.
 * - 프록시 5xx(HTML): 서버 롤아웃·장애 — 쿼리 이름 없이 상태 코드로만 묶어 실행당 한 건.
 * 나머지(서버 오류·GraphQL 검증 실패·queryFn 가공 중 예외)는 우리가 고칠 일이라 보낸다.
 */
export function queryErrorReportKey(
  error: unknown,
  source: {kind: 'query' | 'mutation'; key: unknown},
): string | null {
  if (isCancelledError(error)) return null;
  if (isOfflineError(error)) return null;
  if (error instanceof HttpStatusError) return `http:${error.status}`;
  if (error instanceof FetchError && error.code != null) {
    if (EXPECTED_CODES.has(error.code)) return null;
    if (source.kind === 'mutation' && USER_INPUT_CODES.has(error.code)) {
      return null;
    }
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

// 기기 쪽 연결 문제의 흔적 — RN fetch(`Network request failed`), Expo fetch(`fetch failed: …` 에 OS 원인:
// Android UnknownHost·iOS 한국어 NSURLError), Firebase 메시징(SERVICE_NOT_AVAILABLE), expo-updates(timed out).
const OFFLINE_PATTERN =
  /\b(network|offline|internet|timed out)\b|^fetch failed:|UnknownHostException|Unable to resolve host|SERVICE_NOT_AVAILABLE|네트워크 연결|인터넷 연결|오프라인|서버에 연결할 수 없|시간이 초과/i;

/**
 * 기기가 오프라인이라 난 실패 — 고칠 게 없다. fetch 는 `TypeError: Network request failed`,
 * Expo 의 fetch 는 `fetch failed: <OS 원인>`, expo-updates·Firebase 는 메시지에 network·offline·timed out 을 담는다.
 * 서버가 준 GraphQL 에러(FetchError)는 메시지에 그런 말이 있어도 연결 문제가 아니다.
 */
export function isOfflineError(error: unknown): boolean {
  if (error instanceof FetchError) return false;
  const message = error instanceof Error ? error.message : '';
  return OFFLINE_PATTERN.test(message);
}

/** 쿼리 키의 첫 칸 — 이 레포의 키는 `['product', …]` 처럼 도메인 이름으로 시작한다. */
export function queryName(key: unknown): string {
  return Array.isArray(key) ? String(key[0] ?? 'unknown') : 'unknown';
}
