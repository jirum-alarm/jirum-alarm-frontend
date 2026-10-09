/**
 * execute 가 던진 FetchError 에서 GraphQL 부분 응답(data)을 꺼낸다. 없으면 null.
 *
 * GraphQL 은 한 행의 nullable 필드 오류(예: Int 자리에 219.76)도 응답 전체에 errors 를 싣고, 그 필드만 null 로 비운 data 를 같이 준다.
 * execute 는 errors 가 있으면 던지므로 목록 하나가 통째로 실패했다(2026-10-09 /deals 500).
 * non-null 필드가 실패해 data 가 null 까지 번지면 여기서도 null — 그때는 호출부가 원래대로 던진다.
 */
export function partialGraphqlData<T>(error: unknown): T | null {
  const data = (error as { data?: { data?: unknown } } | null | undefined)?.data?.data;
  return data && typeof data === 'object' ? (data as T) : null;
}
