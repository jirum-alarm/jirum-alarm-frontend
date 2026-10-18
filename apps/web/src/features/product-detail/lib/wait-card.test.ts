import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  formatMonthDay,
  formatUnitPrice,
  shownVerdict,
  waitCardCopy,
  waitCardImpressionDetail,
  waitWatchToast,
} = require('./wait-card.ts') as typeof import('./wait-card');

const card = {
  keyword: '삼다수',
  unit: 'LITER',
  goodPrice: 390,
  goodDays: 5,
  windowDays: 90,
  typicalGapDays: 6,
  lastGoodAt: '2026-10-10T03:00:00.000Z',
  pageUnitPrice: 374.58,
};

describe('shownVerdict — 근거 블록과 다른 말을 하지 않게', () => {
  it('가격 답(HISTORY·MARKET)이 있으면 STATS', () => {
    assert.equal(shownVerdict('WAIT', 'HISTORY'), 'STATS');
    assert.equal(shownVerdict('BUY_NOW', 'MARKET'), 'STATS');
  });
  it('커뮤니티 반응 근거·근거 없음이면 서버 판정 그대로, 모르는 값은 STATS', () => {
    assert.equal(shownVerdict('BUY_NOW', 'COMMUNITY'), 'BUY_NOW');
    assert.equal(shownVerdict('RARE', null), 'RARE');
    assert.equal(shownVerdict('???', null), 'STATS');
    assert.equal(shownVerdict(null, undefined), 'STATS');
  });
});

describe('waitCardImpressionDetail — 두 군의 노출 기록', () => {
  it('card 군은 wait_card, 대조군은 wait_card_ctl, 카드가 없거나 excluded 면 기록 안 함', () => {
    assert.equal(
      waitCardImpressionDetail({ arm: 'card', eligible: true }, 'BUY_NOW'),
      'wait_card:BUY_NOW',
    );
    assert.equal(
      waitCardImpressionDetail({ arm: 'control', eligible: true }, 'STATS'),
      'wait_card_ctl:STATS',
    );
    assert.equal(waitCardImpressionDetail({ arm: 'card', eligible: false }, 'STATS'), null);
    assert.equal(waitCardImpressionDetail({ arm: 'excluded', eligible: false }, 'STATS'), null);
    assert.equal(waitCardImpressionDetail(null, 'STATS'), null);
  });
  it('서버 detail 형식(종류:근거, [A-Za-z_])에 맞는다', () => {
    for (const v of ['BUY_NOW', 'WAIT', 'RARE', 'STATS'] as const) {
      assert.match(
        waitCardImpressionDetail({ arm: 'control', eligible: true }, v)!,
        /^[a-z_]{1,32}:[A-Za-z_]{1,32}$/,
      );
    }
  });
});

describe('formatUnitPrice · formatMonthDay', () => {
  it('단위마다 앞말, 원 단위 반올림, 상품권은 액면가 비율', () => {
    assert.equal(formatUnitPrice(374.58, 'LITER'), '1L당 375원');
    assert.equal(formatUnitPrice(1513.5, 'HUNDRED_GRAM'), '100g당 1,514원');
    assert.equal(formatUnitPrice(2120000, 'TOTAL'), '2,120,000원');
    assert.equal(formatUnitPrice(0.93, 'FACE_VALUE'), '액면가의 93%');
  });
  it('KST 날짜(UTC 15시 이후는 다음 날)', () => {
    assert.equal(formatMonthDay('2026-10-10T03:00:00.000Z'), '10/10');
    assert.equal(formatMonthDay('2026-10-10T16:00:00.000Z'), '10/11');
    assert.equal(formatMonthDay(null), null);
  });
});

describe('waitCardCopy', () => {
  it('BUY_NOW·WAIT·RARE 는 지금 값, STATS 는 마지막 날', () => {
    assert.deepEqual(waitCardCopy(card, 'BUY_NOW'), {
      title: '‘삼다수’ 좋은 가격은 1L당 390원 이하',
      detail: '커뮤니티 핫딜 90일 중 5일 · 지금 1L당 375원, 좋은 가격이에요',
    });
    assert.equal(
      waitCardCopy({ ...card, pageUnitPrice: 452 }, 'WAIT')!.detail,
      '커뮤니티 핫딜 90일 중 5일 · 지금 1L당 452원, 보통 6일에 한 번 와요',
    );
    assert.equal(
      waitCardCopy({ ...card, pageUnitPrice: 452, goodDays: 2 }, 'RARE')!.detail,
      '커뮤니티 핫딜 90일 중 2일뿐 · 지금 1L당 452원',
    );
    assert.equal(waitCardCopy(card, 'STATS')!.detail, '커뮤니티 핫딜 90일 중 5일 · 마지막 10/10');
  });
  it('내용이 비면 null(그리지 않음)', () => {
    assert.equal(waitCardCopy({ ...card, keyword: null }, 'STATS'), null);
    assert.equal(waitCardCopy({ ...card, goodPrice: null }, 'STATS'), null);
  });
  it('등록 토스트', () => {
    assert.equal(waitWatchToast(card), '‘삼다수’ 1L당 390원 이하일 때만 알려드릴게요');
  });
});
