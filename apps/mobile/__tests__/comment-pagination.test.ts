export {};

/**
 * CommentQueries.infiniteComments 의 getNextPageParam 규칙.
 * 여기가 틀리면 빈 페이지를 무한히 요청하거나(마지막 페이지 판정 실패)
 * 목록이 조기에 끊긴다.
 */
const LIMIT = 10;

function getNextPageParam(lastPage: Array<{searchAfter?: string[] | null}>) {
  const last = lastPage.at(-1);
  if (!last || lastPage.length < LIMIT) return null;
  return last.searchAfter ?? null;
}

const page = (n: number, searchAfter: string[] | null = ['cursor']) =>
  Array.from({length: n}, () => ({searchAfter}));

describe('댓글 커서 페이지네이션', () => {
  it('꽉 찬 페이지면 마지막 행의 searchAfter 를 다음 커서로 쓴다', () => {
    expect(getNextPageParam(page(LIMIT, ['c1', 'c2']))).toEqual(['c1', 'c2']);
  });

  // limit 보다 짧으면 더 없는 것. searchAfter 만 보면 계속 요청한다.
  it('limit 보다 짧은 페이지면 멈춘다', () => {
    expect(getNextPageParam(page(LIMIT - 1))).toBeNull();
    expect(getNextPageParam(page(1))).toBeNull();
  });

  it('빈 페이지면 멈춘다', () => {
    expect(getNextPageParam([])).toBeNull();
  });

  // 서버가 searchAfter 를 안 주면 더 진행할 수 없다.
  it('꽉 찼어도 searchAfter 가 없으면 멈춘다', () => {
    expect(getNextPageParam(page(LIMIT, null))).toBeNull();
  });
});
