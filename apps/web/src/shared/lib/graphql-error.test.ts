import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { getGraphqlErrorMessage } =
  require('./graphql-error.ts') as typeof import('./graphql-error');

// execute 가 던지는 FetchError 를 흉내 낸다 — message 가 JSON 문자열이라는 게 핵심.
class FakeFetchError extends Error {
  data: unknown;
  constructor(data: unknown) {
    super('');
    this.name = 'FetchError';
    this.data = data;
    this.message = JSON.stringify({ data });
  }
}

const gqlError = (message: string, code: string, statusCode: number): FakeFetchError =>
  new FakeFetchError({
    errors: [{ message, extensions: { code, originalError: { message, statusCode } } }],
    data: null,
  });

describe('getGraphqlErrorMessage', () => {
  it('이미 등록된 키워드 — 서버 메시지를 꺼낸다', () => {
    const error = gqlError('이미 등록된 키워드 알림이에요.', 'BAD_REQUEST', 400);
    assert.equal(getGraphqlErrorMessage(error), '이미 등록된 키워드 알림이에요.');
  });

  it('FetchError 의 JSON message 는 절대 내보내지 않는다', () => {
    const error = gqlError('Internal server error', 'INTERNAL_SERVER_ERROR', 500);
    assert.equal(getGraphqlErrorMessage(error), '');
  });

  it('영어 원문(운영 403 응답)은 숨긴다', () => {
    const error = gqlError('Forbidden resource', 'FORBIDDEN', 403);
    assert.equal(getGraphqlErrorMessage(error), '');
  });

  it('HTTP 에러로 errors 가 없는 FetchError 는 빈 값', () => {
    assert.equal(getGraphqlErrorMessage(new FakeFetchError('<html>502</html>')), '');
  });

  it('클라이언트에서 던진 한국어 Error 는 그대로', () => {
    assert.equal(
      getGraphqlErrorMessage(new Error('키워드를 입력해 주세요.')),
      '키워드를 입력해 주세요.',
    );
  });

  it('네트워크 TypeError 는 빈 값', () => {
    assert.equal(getGraphqlErrorMessage(new TypeError('Failed to fetch')), '');
  });

  it('null·문자열', () => {
    assert.equal(getGraphqlErrorMessage(null), '');
    assert.equal(getGraphqlErrorMessage('x'), '');
  });
});
