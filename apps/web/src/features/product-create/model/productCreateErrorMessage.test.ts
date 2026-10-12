import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { productCreateErrorMessage } =
  require('./productCreateErrorMessage.ts') as typeof import('./productCreateErrorMessage');

type OriginalError = { message: string | string[]; error: string; statusCode: number };

// execute 가 던지는 FetchError 모양(data.errors[]).
const fetchError = (code: string, originalError: OriginalError, status?: number) => ({
  name: 'FetchError',
  data: { errors: [{ message: 'x', extensions: { code, status, originalError } }], data: null },
});

describe('productCreateErrorMessage', () => {
  it('비로그인 — 운영 응답 그대로(403 FORBIDDEN)', () => {
    const error = fetchError('FORBIDDEN', {
      message: 'Forbidden resource',
      error: 'Forbidden',
      statusCode: 403,
    });
    assert.equal(
      productCreateErrorMessage(error),
      '로그인이 만료됐어요. 다시 로그인한 뒤 등록해 주세요.',
    );
  });

  it('없는 카테고리 — 404', () => {
    const error = fetchError(
      'INTERNAL_SERVER_ERROR',
      { message: '존재하지 않는 카테고리입니다.', error: 'Not Found', statusCode: 404 },
      404,
    );
    assert.equal(
      productCreateErrorMessage(error),
      '선택한 카테고리를 찾을 수 없어요. 카테고리를 다시 선택해 주세요.',
    );
  });

  it('검증 실패 — 서버의 한국어 메시지를 보여준다', () => {
    const error = fetchError('BAD_REQUEST', {
      message: ['구매 링크는 2048자 이하로 입력해 주세요.'],
      error: 'Bad Request',
      statusCode: 400,
    });
    assert.equal(productCreateErrorMessage(error), '구매 링크는 2048자 이하로 입력해 주세요.');
  });

  it('검증 실패 — 영어 기본 메시지는 숨긴다', () => {
    const error = fetchError('BAD_REQUEST', {
      message: ['url must be shorter than or equal to 2048 characters'],
      error: 'Bad Request',
      statusCode: 400,
    });
    assert.equal(productCreateErrorMessage(error), '입력한 내용을 다시 확인해 주세요.');
  });

  it('DB 에러(500) — 다시 시도 안내', () => {
    const error = fetchError('INTERNAL_SERVER_ERROR', {
      message: 'DB 에러가 발생했습니다.',
      error: 'Internal Server Error',
      statusCode: 500,
    });
    assert.equal(
      productCreateErrorMessage(error),
      '핫딜 등록에 실패했어요. 잠시 후 다시 시도해 주세요.',
    );
  });

  it('네트워크 실패', () => {
    assert.equal(
      productCreateErrorMessage(new TypeError('Failed to fetch')),
      '인터넷 연결을 확인한 뒤 다시 시도해 주세요.',
    );
  });

  it('카테고리 미선택', () => {
    assert.equal(
      productCreateErrorMessage(new Error('CATEGORY_REQUIRED')),
      '카테고리를 선택해 주세요.',
    );
  });
});
