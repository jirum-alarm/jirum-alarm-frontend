import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  formatCountdown,
  formatOpenAt,
  formatTossViewCount,
  getTimeDealOpening,
  getTimeDealTimer,
  getTossTimeDeal,
  kstLocalNow,
  nextKstMidnight,
  parseOpenAtFromTitle,
} = require('./toss-time-deal.ts') as typeof import('./toss-time-deal');

/** KST 시각 → epoch ms */
const kst = (iso: string) => Date.parse(`${iso}+09:00`);
// 2026-10-15 13:00 KST
const NOON = kst('2026-10-15T13:00:00');

const toss = (extra: Record<string, unknown> = {}) => ({
  toss: {
    todayDealStartAt: '2026-10-15T00:00:00',
    todayDealEndAt: '2026-10-16T00:00:00',
    dealStatus: 'ON_GOING',
    pageViewCount: 2125,
    ...extra,
  },
});

describe('kstLocalNow', () => {
  it('UTC 를 KST 로컬시각 문자열로', () => {
    assert.equal(kstLocalNow(NOON), '2026-10-15T13:00:00');
  });
});

describe('formatTossViewCount', () => {
  it('1만 미만은 쉼표, 이상은 만 단위 소수 한 자리(내림)', () => {
    assert.equal(formatTossViewCount(2125), '2,125명이 봤어요');
    assert.equal(formatTossViewCount(10_000), '1만명이 봤어요');
    assert.equal(formatTossViewCount(12_999), '1.2만명이 봤어요');
    assert.equal(formatTossViewCount(30_400), '3만명이 봤어요');
  });
});

describe('타이머 표기', () => {
  it('하루 미만은 H:MM:SS, 이상은 N일 N시간', () => {
    assert.equal(formatCountdown(3 * 3_600_000 + 7 * 60_000 + 9_000), '3:07:09');
    assert.equal(formatCountdown(-5), '0:00:00');
    assert.equal(formatCountdown(53 * 3_600_000), '2일 5시간');
  });

  it('다음 자정은 KST 기준', () => {
    assert.equal(nextKstMidnight(NOON), kst('2026-10-16T00:00:00'));
    assert.equal(nextKstMidnight(kst('2026-10-15T23:59:59')), kst('2026-10-16T00:00:00'));
    assert.equal(nextKstMidnight(kst('2026-10-16T00:00:00')), kst('2026-10-17T00:00:00'));
  });

  it('오픈 시각: 오늘/내일/날짜, 자정은 「밤 12시」', () => {
    assert.equal(formatOpenAt(kst('2026-10-15T17:00:00'), NOON), '오늘 17:00');
    assert.equal(formatOpenAt(kst('2026-10-16T10:30:00'), NOON), '내일 10:30');
    assert.equal(formatOpenAt(kst('2026-10-18T10:00:00'), NOON), '10/18 10:00');
    assert.equal(formatOpenAt(kst('2026-10-16T00:00:00'), NOON), '오늘 밤 12시');
    assert.equal(formatOpenAt(kst('2026-10-17T00:00:00'), NOON), '내일 밤 12시');
  });
});

describe('getTossTimeDeal', () => {
  it('판매 중이면 「선착순특가」·「하루만」·조회수', () => {
    assert.deepEqual(getTossTimeDeal(toss(), NOON), {
      status: 'ON_SALE',
      label: '선착순특가',
      pricePrefix: '하루만',
      viewCountText: '2,125명이 봤어요',
      endAt: kst('2026-10-16T00:00:00'),
    });
  });

  it('마감 상태는 status 로만 안다(isSoldOut 과 별개)', () => {
    assert.equal(getTossTimeDeal(toss({ dealStatus: 'SOLD_OUT' }), NOON)?.label, '선착순 마감');
    assert.equal(
      getTossTimeDeal(toss({ dealStatus: 'TEMPORARILY_SOLD_OUT' }), NOON)?.label,
      '일시품절',
    );
    assert.equal(getTossTimeDeal(toss({ dealStatus: 'SOLD_OUT' }), NOON)?.pricePrefix, undefined);
  });

  it('창 밖(어제 하루특가)이면 배지 없음 — 자정 정각에 끝난다', () => {
    assert.equal(getTossTimeDeal(toss(), NOON + 24 * 3_600_000), null);
    assert.equal(getTossTimeDeal(toss(), kst('2026-10-16T00:00:00')), null);
  });

  it('★시작 전이면 「오늘 밤 12시 오픈」(다음 날 하루특가가 미리 들어온 경우)', () => {
    const tomorrow = toss({
      todayDealStartAt: '2026-10-16T00:00:00+09:00',
      todayDealEndAt: '2026-10-17T00:00:00+09:00',
    });
    const r = getTossTimeDeal(tomorrow, kst('2026-10-15T23:00:00'));
    assert.equal(r?.status, 'UPCOMING');
    assert.equal(r?.label, '오늘 밤 12시 오픈');
    assert.equal(r?.openAt, kst('2026-10-16T00:00:00'));
    assert.equal(r?.pricePrefix, undefined);
  });

  it('조회 100 미만은 숫자를 안 보인다', () => {
    assert.equal(getTossTimeDeal(toss({ pageViewCount: 42 }), NOON)?.viewCountText, undefined);
  });

  it('토스 하루특가가 아니면 null', () => {
    assert.equal(getTossTimeDeal(null, NOON), null);
    assert.equal(getTossTimeDeal({}, NOON), null);
    assert.equal(getTossTimeDeal({ toss: { section: 'daily' } }, NOON), null);
  });
});

describe('parseOpenAtFromTitle — 커뮤니티 예고 글', () => {
  const posted = kst('2026-10-15T11:20:00');
  const at = (title: string, p: number = posted) => {
    const r = parseOpenAtFromTitle(title, new Date(p).toISOString());
    return r == null ? null : kstLocalNow(r).slice(0, 16);
  };

  it('오늘·내일·오전/오후·N시 오픈', () => {
    assert.equal(at('오늘 17시 네이버 LIVE 4세대 OLED'), '2026-10-15T17:00');
    assert.equal(at('내일 오전 10시 선착순 쿠폰'), '2026-10-16T10:00');
    assert.equal(at('오후 8시 30분 타임딜 시작'), '2026-10-15T20:30');
    assert.equal(at('밤 9시 반 오픈 특가'), '2026-10-15T21:30');
    assert.equal(at('20시 오픈 에어팟'), '2026-10-15T20:00');
  });

  it('자정: 그냥 「자정」·「오늘 자정」은 오늘 밤 12시, 「N일 자정」은 N일 0시(커뮤니티 관행)', () => {
    assert.equal(at('자정 오픈 펩시 제로'), '2026-10-16T00:00');
    assert.equal(at('오늘 자정 선착순'), '2026-10-16T00:00');
    assert.equal(at('16일 자정 펩제 선착순'), '2026-10-16T00:00');
    assert.equal(at('17일 10시 선착순 쿠폰'), '2026-10-17T10:00');
  });

  it('오전/오후 없는 「N시」는 글 올린 뒤 첫 시각(오늘 N시 → 오늘 N+12시 → 내일 N시)', () => {
    assert.equal(at('홀베리 레몬라인업 4900원 1시오픈', kst('2026-09-29T12:40:00')), '2026-09-29T13:00');
    assert.equal(at('4시판매예정 엘포 김치', kst('2026-10-14T08:58:00')), '2026-10-14T16:00');
    assert.equal(at('12시 선착순딜 아이스바', kst('2026-10-14T23:19:00')), '2026-10-15T00:00');
    assert.equal(at('12시 선착순딜 아이스바', kst('2026-10-14T10:00:00')), '2026-10-14T12:00');
    assert.equal(at('10시 오픈 선착순', kst('2026-10-15T23:30:00')), '2026-10-16T10:00');
    assert.equal(at('20시 오픈 에어팟', kst('2026-10-15T21:30:00')), '2026-10-16T20:00');
  });

  it('월/일 표기 — 「9/17 15시」「10.2 15시~」「9월 18일 금 11시」「10/15(목) 15시」', () => {
    assert.equal(at('LG 모니터 라이브 사전 안내(9/17 15시)', kst('2026-09-16T13:46:00')), '2026-09-17T15:00');
    assert.equal(at('LG 가을 세일 (10.2 15시~)', kst('2026-10-01T15:27:00')), '2026-10-02T15:00');
    assert.equal(
      at('에어컨 24시간 파격 특가 (9월 18일 금 11시 ~ 9월 19일 토 10시59분)', kst('2026-09-16T17:30:00')),
      '2026-09-18T11:00',
    );
    assert.equal(at('특집 라이브 사전 안내 10/15(목) 15시~16시', kst('2026-10-14T14:52:00')), '2026-10-15T15:00');
    assert.equal(at('9월 20일 저녁7시, 앵콜라이브', kst('2026-09-18T15:49:00')), '2026-09-20T19:00');
  });

  it('시각 앞에 따로 적힌 날짜를 쓴다(「까지」 붙은 끝 날짜는 빼고)', () => {
    assert.equal(at('9/28~10/2 디카페인 음료 1+1 (오후 2시~8시)', kst('2026-09-26T15:57:00')), '2026-09-28T14:00');
    assert.equal(at('메가커피 천원! 10/16까지 매일 오후 1시 ㄱㄱ', kst('2026-10-12T11:27:00')), '2026-10-12T13:00');
  });

  it('「모자정리」의 자정·막 지난 시각은 오픈으로 안 읽는다', () => {
    assert.equal(at('메르홈 무타공 옷장 모자정리 선착순', kst('2026-10-01T03:32:00')), null);
    assert.equal(at('게이밍노트북 7시 라방체감가180만', kst('2026-09-21T19:52:00')), '2026-09-21T19:00');
  });

  it('「라방」도 여는 말', () => {
    assert.equal(at('플스 프로(한정수량)외 다수 / 19시 라방', kst('2026-09-29T08:02:00')), '2026-09-29T19:00');
  });

  it('끝나는 시각·시간 길이·모델명은 오픈으로 안 읽는다', () => {
    assert.equal(at('오후 3시까지 주문시 당일발송 선착순'), null);
    assert.equal(at('자정 마감 특가'), null);
    assert.equal(at('24시간 배송 선착순'), null);
    assert.equal(at('지포스 5090시리즈 특가'), null);
    assert.equal(at('3.5시 방향 특가'), null);
  });

  it('시각만 있는 제목은 예고·오픈·선착순 같은 말이 있어야 믿는다', () => {
    assert.equal(at('17시 쿠팡 특가 에어팟'), null);
    assert.equal(at('07시이전] 대정한우 구이'), null);
    assert.equal(at('서울우유 2.3L 타임세일 4시까지 4980원'), null);
    assert.equal(at('17시 선착순 에어팟'), '2026-10-15T17:00');
  });

  it('일주일 넘게 먼 예고는 버린다', () => {
    assert.equal(at('30일 10시 오픈'), null);
  });
});

describe('getTimeDealOpening', () => {
  it('커뮤니티 예고 글이 오픈 전이면 라벨·시각', () => {
    const r = getTimeDealOpening(
      { title: '오늘 17시 네이버 LIVE', postedAt: new Date(kst('2026-10-15T11:20:00')).toISOString() },
      NOON,
    );
    assert.deepEqual(r, { openAt: kst('2026-10-15T17:00:00'), label: '오늘 17:00 오픈' });
  });

  it('이미 열렸거나 끝난 글·판매 중인 토스 딜은 null', () => {
    const posted = new Date(kst('2026-10-15T08:00:00')).toISOString();
    assert.equal(getTimeDealOpening({ title: '오늘 10시 오픈', postedAt: posted }, NOON), null);
    assert.equal(
      getTimeDealOpening({ title: '오늘 17시 오픈', postedAt: posted, isEnd: true }, NOON),
      null,
    );
    assert.equal(getTimeDealOpening({ title: '오늘 17시 오픈', postedAt: posted, data: toss() }, NOON), null);
  });
});

describe('getTimeDealTimer — 상세 타이머', () => {
  it('판매 중인 토스 하루특가는 끝나는 시각까지(오늘 밤 12시 종료)', () => {
    assert.deepEqual(getTimeDealTimer({ data: toss() }, NOON), {
      kind: 'closing',
      endAt: kst('2026-10-16T00:00:00'),
      endLabel: '오늘 밤 12시 종료',
    });
  });

  it('마감·일시품절은 타이머 없이 상태만', () => {
    assert.deepEqual(getTimeDealTimer({ data: toss({ dealStatus: 'SOLD_OUT' }) }, NOON), {
      kind: 'soldOut',
      label: '선착순 마감',
    });
    assert.deepEqual(
      getTimeDealTimer({ data: toss({ dealStatus: 'TEMPORARILY_SOLD_OUT' }) }, NOON),
      { kind: 'soldOut', label: '일시품절' },
    );
  });

  it('오픈 전(토스 다음 날 특가·커뮤니티 예고 글)은 여는 시각까지', () => {
    assert.deepEqual(
      getTimeDealTimer(
        {
          data: toss({
            todayDealStartAt: '2026-10-16T00:00:00',
            todayDealEndAt: '2026-10-17T00:00:00',
          }),
        },
        NOON,
      ),
      { kind: 'opening', openAt: kst('2026-10-16T00:00:00'), label: '오늘 밤 12시 오픈' },
    );
    assert.deepEqual(
      getTimeDealTimer(
        { title: '오늘 17시 네이버 LIVE', postedAt: new Date(kst('2026-10-15T11:20:00')).toISOString() },
        NOON,
      ),
      { kind: 'opening', openAt: kst('2026-10-15T17:00:00'), label: '오늘 17:00 오픈' },
    );
  });

  it('끝난 딜·지난 하루특가·일반 상품은 null(종료 시각을 모르면 타이머를 내지 않는다)', () => {
    assert.equal(getTimeDealTimer({ data: toss(), isEnd: true }, NOON), null);
    assert.equal(getTimeDealTimer({ data: toss() }, kst('2026-10-16T00:00:01')), null);
    assert.equal(getTimeDealTimer({ title: '맛밤 42g 10개 9,900원', postedAt: NOON }, NOON), null);
  });
});
