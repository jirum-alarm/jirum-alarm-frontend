// node --test 로 바로 돌리도록 경로 별칭(@/) import 없이 FetchError 모양만 읽는다.
const HANGUL = /[가-힣]/;

/**
 * 서버가 사용자에게 보여주라고 준 메시지(예: '이미 등록된 키워드 알림이에요.')를 꺼낸다. 없으면 ''.
 *
 * execute 는 GraphQL 에러를 FetchError.data.errors 에 담는다. 예전엔 graphql-request 모양
 * (error.response.errors)을 읽어서 늘 빈 값이었고, 그 뒤 Error.message 로 넘어가면
 * FetchError 의 JSON 문자열이 토스트에 그대로 떴다. 'Forbidden resource' 같은 영어 원문도
 * 사용자에게 의미가 없으니 한국어 메시지만 돌려준다.
 */
export function getGraphqlErrorMessage(error: unknown): string {
  const data = (error as { data?: { errors?: unknown } } | null)?.data;
  const errors = Array.isArray(data?.errors) ? data.errors : [];
  const message = (errors[0] as { message?: unknown } | undefined)?.message;
  if (typeof message === 'string' && HANGUL.test(message)) return message;

  // FetchError 가 아닌 예외(클라이언트에서 던진 한국어 Error 등).
  if (!(error && typeof error === 'object' && 'data' in error) && error instanceof Error) {
    return HANGUL.test(error.message) ? error.message : '';
  }
  return '';
}
