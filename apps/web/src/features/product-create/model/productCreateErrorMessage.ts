// node --test 로 바로 돌리도록 경로 별칭(@/) import 없이 FetchError 모양만 읽는다.
type GraphqlErrorLike = {
  extensions?: {
    code?: string;
    status?: number;
    originalError?: { message?: string | string[]; statusCode?: number };
  };
};

const FALLBACK = '핫딜을 등록하지 못했어요. 잠시 후 다시 시도해 주세요.';
const HANGUL = /[가-힣]/;

function firstGraphqlError(error: unknown): GraphqlErrorLike | undefined {
  const data = (error as { data?: { errors?: unknown } } | null)?.data;
  return Array.isArray(data?.errors) ? (data.errors[0] as GraphqlErrorLike) : undefined;
}

/**
 * 핫딜 등록 실패를 사용자가 고칠 수 있는 말로 바꾼다. 실패 사유를 안 보여주니
 * 사용자가 메일로 이유를 물어야 했다(2026-10-12, 긴 링크로 DB 저장 실패).
 */
export function productCreateErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === 'CATEGORY_REQUIRED') {
    return '카테고리를 선택해 주세요.';
  }
  // fetch 자체가 실패(오프라인·연결 끊김)하면 TypeError 가 난다.
  if (error instanceof TypeError) {
    return '인터넷 연결을 확인한 뒤 다시 시도해 주세요.';
  }

  const gqlError = firstGraphqlError(error);
  if (!gqlError) return FALLBACK;

  const ext = gqlError.extensions ?? {};
  const status = ext.originalError?.statusCode ?? ext.status;

  // 비로그인·만료 토큰은 Roles 가드에서 403(FORBIDDEN)으로 온다.
  if (
    status === 401 ||
    status === 403 ||
    ext.code === 'UNAUTHENTICATED' ||
    ext.code === 'FORBIDDEN'
  ) {
    return '로그인이 만료됐어요. 다시 로그인한 뒤 등록해 주세요.';
  }
  // 등록에서 나는 404 는 카테고리 조회뿐이다.
  if (status === 404) {
    return '선택한 카테고리를 찾을 수 없어요. 카테고리를 다시 선택해 주세요.';
  }
  if (status === 400) {
    // 서버 DTO 의 한국어 검증 메시지만 그대로 보여준다(기본 영어 메시지는 사용자에게 의미가 없다).
    const raw = ext.originalError?.message;
    const message = Array.isArray(raw) ? raw[0] : raw;
    return message && HANGUL.test(message) ? message : '입력한 내용을 다시 확인해 주세요.';
  }
  return FALLBACK;
}
