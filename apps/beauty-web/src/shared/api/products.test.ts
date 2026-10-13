import assert from 'node:assert/strict';
import { test } from 'node:test';

import { okachatAndroidIntent } from '../lib/okachat.ts';
import { isProductionHostname, isServiceHostname } from '../lib/service-host.ts';

import {
  kstStartOfDayBefore,
  nextCursor,
  rankingVariables,
  stripPriceFromTitle,
  toTossDeal,
} from './products.ts';

test('KST 자정 기준 n일 전 — KST 로 이미 다음 날이면 그 날 기준', () => {
  // 2026-10-13T16:30Z = KST 10/14 01:30 → KST 10/14 자정 = 10/13T15:00Z, 60일 전 = 08/14T15:00Z
  const now = Date.parse('2026-10-13T16:30:00Z');
  assert.equal(kstStartOfDayBefore(0, now), '2026-10-13T15:00:00.000Z');
  assert.equal(kstStartOfDayBefore(60, now), '2026-08-14T15:00:00.000Z');
});

test('KST 하루 안에서는 같은 startDate — 서버 데이터 캐시 키가 흔들리지 않는다', () => {
  const a = rankingVariables(3, 20, Date.parse('2026-10-13T15:00:01Z'));
  const b = rankingVariables(3, 20, Date.parse('2026-10-14T14:59:59Z'));
  assert.equal(a.startDate, b.startDate);
  assert.deepEqual(
    { ...a, startDate: undefined },
    {
      limit: 20,
      orderBy: 'COMMUNITY_RANKING',
      startDate: undefined,
      categoryId: 3,
      orderOption: 'DESC',
      isEnd: false,
    },
  );
});

test('다음 쪽 커서 — 한 쪽이 덜 차면 끝', () => {
  const p = (id: string, searchAfter: string[] | null) => ({
    id,
    title: id,
    postedAt: '',
    searchAfter,
  });
  assert.equal(nextCursor([p('1', ['9', '1'])], 2), null);
  assert.deepEqual(nextCursor([p('1', ['9', '1']), p('2', ['8', '2'])], 2), ['8', '2']);
  assert.equal(nextCursor([p('1', null), p('2', null)], 2), null);
});

test('토스 제목에서 가격 떼기·확장정보 꺼내기(가격은 싣지 않는다)', () => {
  assert.equal(
    stripPriceFromTitle('메리몽드 체리하트 메가 틴트 01 #뮤트체리 5g 7,900원'),
    '메리몽드 체리하트 메가 틴트 01 #뮤트체리 5g',
  );
  const deal = toTossDeal({
    id: '1',
    title: '바세린 바디밤 15g 1개 7,600원',
    thumbnail: null,
    data: { toss: { salePrice: 7600, discountRate: 30, arrivalGuaranteed: true, rating: 4.8 } },
  });
  assert.deepEqual(deal, {
    id: '1',
    title: '바세린 바디밤 15g 1개',
    thumbnail: undefined,
    badge: undefined,
    bestSeller: undefined,
    arrivalGuaranteed: true,
    specialProduct: undefined,
    rating: 4.8,
    reviewCount: undefined,
  });
});

test('쓰기 요청은 지름알림 도메인에서만, GTM 은 운영 apex 에서만', () => {
  assert.equal(isServiceHostname('jirum-alarm.com'), true);
  assert.equal(isServiceHostname('dev.jirum-alarm.com'), true);
  assert.equal(isServiceHostname('localhost'), false);
  assert.equal(isServiceHostname('evil-jirum-alarm.com'), false);
  assert.equal(isProductionHostname('jirum-alarm.com'), true);
  assert.equal(isProductionHostname('dev.jirum-alarm.com'), false);
});

test('뷰티 카톡방 안드로이드 intent', () => {
  assert.equal(
    okachatAndroidIntent('https://open.kakao.com/o/AbCd1234'),
    `intent://join?l=AbCd1234&r=EW#Intent;scheme=kakaoopen;package=com.kakao.talk;S.browser_fallback_url=${encodeURIComponent('https://open.kakao.com/o/AbCd1234')};end`,
  );
  assert.equal(okachatAndroidIntent('https://example.com'), null);
});
