import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  KEYWORD_HUBS,
  findKeywordHub,
  matchesKeywordHub,
  findKeywordHubsForTitle,
  keywordHubPath,
  buildKeywordHubSeo,
  summarizeKeywordHubRhythm,
  describeKeywordHubRhythm,
  KEYWORD_HUB_MIN_DEALS,
} = require('./keyword-hub.ts') as typeof import('./keyword-hub');

const hub = (slug: string) => {
  const h = findKeywordHub(slug);
  assert.ok(h, slug);
  return h;
};

describe('KEYWORD_HUBS', () => {
  it('slug 가 겹치지 않는다', () => {
    const slugs = KEYWORD_HUBS.map((h) => h.slug.toLowerCase());
    assert.equal(new Set(slugs).size, slugs.length);
  });
});

describe('findKeywordHub', () => {
  it('대소문자·공백을 무시하고, 목록 밖은 undefined(=404)', () => {
    assert.equal(findKeywordHub('PS5')?.slug, 'ps5');
    assert.equal(findKeywordHub('아무거나'), undefined);
  });
});

describe('matchesKeywordHub', () => {
  it('검색 API 가 동의어로 넓힌 결과는 뺀다(햇반 → 컵밥, 에어팟 → 에어프라이팟)', () => {
    assert.equal(matchesKeywordHub('오뚜기 컵밥 전주식 콩나물국밥 12개', hub('햇반')), false);
    assert.equal(matchesKeywordHub('CJ 햇반 210g 36개', hub('햇반')), true);
    assert.equal(matchesKeywordHub('요리조리팟 실리콘 에어프라이팟', hub('에어팟')), false);
  });

  it('별칭·공백 흔들림을 같은 상품으로 친다', () => {
    assert.equal(matchesKeywordHub('메가MGC커피 아메리카노', hub('메가커피')), true);
    assert.equal(matchesKeywordHub('닌텐도 스위치 2 마리오카트 번들', hub('스위치2')), true);
  });

  it('제외어가 있으면 뺀다(콜라겐·액세서리·전기 스위치)', () => {
    assert.equal(matchesKeywordHub('저분자 콜라겐 30포', hub('콜라')), false);
    assert.equal(matchesKeywordHub('아이폰 17 프로 케이스', hub('아이폰')), false);
    assert.equal(matchesKeywordHub('진흥 전등 스위치 2구', hub('스위치2')), false);
  });

  it('2026-10-14 실측 오탐을 뺀다 — 휴지통·고양이 참치·에어컨 필터·기저귀 사은품', () => {
    assert.equal(matchesKeywordHub('셀미닉 냄새차단 자동 센서 휴지통 18L', hub('휴지')), false);
    assert.equal(matchesKeywordHub('모나리자 화장지 20m 30롤', hub('휴지')), true);
    assert.equal(matchesKeywordHub('테비 고양이캔 치킨참치 85g 48개', hub('참치')), false);
    assert.equal(matchesKeywordHub('사조 안심따개 살코기참치 135g 4개', hub('참치')), true);
    assert.equal(matchesKeywordHub('필립스 차량용 에어컨 필터 PM0.3', hub('에어컨')), false);
    assert.equal(matchesKeywordHub('캐리어 벽걸이 인버터 에어컨 6평', hub('에어컨')), true);
    assert.equal(
      matchesKeywordHub('팸퍼스 통잠팬티 기저귀 8팩+컬쳐랜드 5천원 증정', hub('컬쳐랜드')),
      false,
    );
    assert.equal(matchesKeywordHub('아삭아삭 제주 콜라비 2kg', hub('콜라')), false);
    assert.equal(matchesKeywordHub('갤럭시 Z폴드8 256GB 자급제', hub('갤럭시')), true);
    assert.equal(matchesKeywordHub('미에르 구스다운 갤럭시 패브릭 모듈소파', hub('갤럭시')), false);
  });
});

describe('findKeywordHubsForTitle', () => {
  it('제목에 걸리는 허브를 최대 n개', () => {
    assert.deepEqual(
      findKeywordHubsForTitle('제주 삼다수 2L 24개 생수').map((h) => h.slug),
      ['삼다수', '생수'],
    );
    assert.deepEqual(findKeywordHubsForTitle('아무 상품'), []);
  });
});

describe('keywordHubPath', () => {
  it('한글 slug 를 인코딩한다', () => {
    assert.equal(keywordHubPath(hub('삼다수')), '/keywords/%EC%82%BC%EB%8B%A4%EC%88%98');
  });
});

describe('buildKeywordHubSeo', () => {
  const deal = {
    title: '제주 삼다수 2L 48통',
    price: '33,570원',
    // 9/30 16:00 UTC = 10/1 01:00 KST
    postedAt: '2026-09-30T16:00:00Z',
    provider: { nameKr: '뽐뿌' },
  };

  it('제목 = 이름 + 핫딜 모음 + 최근 30일 건수, 설명 첫 문장에 최근 딜(KST 날짜)', () => {
    const seo = buildKeywordHubSeo(hub('삼다수'), Array(12).fill(deal));
    assert.equal(seo.title, '삼다수 핫딜 모음 · 최근 30일 12건 | 지름알림');
    assert.equal(
      seo.lead,
      '최근 30일 동안 커뮤니티·쇼핑몰 특가에 올라온 삼다수 핫딜 12건을 모았어요. 가장 최근 딜은 제주 삼다수 2L 48통 33,570원(뽐뿌 · 10월 1일).',
    );
    assert.equal(seo.indexable, true);
  });

  it(`딜이 ${KEYWORD_HUB_MIN_DEALS}건 미만이면 noindex, 0건이면 건수 없이`, () => {
    assert.equal(buildKeywordHubSeo(hub('삼다수'), [deal]).indexable, false);
    const empty = buildKeywordHubSeo(hub('삼다수'), []);
    assert.equal(empty.title, '삼다수 핫딜 모음 | 지름알림');
    assert.equal(empty.indexable, false);
  });

  it('최근 딜 제목에 가격이 이미 있으면 다시 붙이지 않는다', () => {
    const seo = buildKeywordHubSeo(hub('햇반'), [
      { ...deal, title: '햇반 루피니빈잡곡밥 12개 14,980원', price: '14,980원' },
    ]);
    assert.match(seo.lead, /12개 14,980원\(뽐뿌/);
  });

  it('최저가 숫자는 제목·설명에 넣지 않는다(원값 오독)', () => {
    const seo = buildKeywordHubSeo(hub('삼다수'), Array(6).fill(deal));
    assert.doesNotMatch(`${seo.title} ${seo.description}`, /최저/);
  });
});

describe('summarizeKeywordHubRhythm', () => {
  const at = (iso: string, nameKr = '뽐뿌') => ({
    title: 't',
    postedAt: iso,
    provider: { nameKr },
  });

  it('올라온 날은 KST 날짜로 센다 — 같은 날 여러 건은 하루', () => {
    const r = summarizeKeywordHubRhythm([
      at('2026-10-01T01:00:00Z'),
      at('2026-10-01T10:00:00Z'),
      // 10/1 16:00 UTC = 10/2 01:00 KST
      at('2026-10-01T16:00:00Z'),
    ]);
    assert.equal(r.activeDays, 2);
  });

  it('주로 올라오는 곳은 몫 15% 이상 최대 2곳', () => {
    const deals = [
      ...Array(6).fill(at('2026-10-01T01:00:00Z', '뽐뿌')),
      ...Array(3).fill(at('2026-10-01T01:00:00Z', '이토랜드')),
      at('2026-10-01T01:00:00Z', '클리앙'),
    ];
    assert.deepEqual(
      summarizeKeywordHubRhythm(deals).topSources.map((s) => s.name),
      ['뽐뿌', '이토랜드'],
    );
  });
});

describe('describeKeywordHubRhythm', () => {
  it('30일 중 21일 이상이면 「거의 매일」, 아니면 알림 권유', () => {
    const often = describeKeywordHubRhythm('계란', {
      activeDays: 29,
      windowDays: 30,
      topSources: [],
    });
    assert.equal(often?.headline, '최근 30일 중 29일 올라왔어요');
    assert.match(often?.advice ?? '', /거의 매일/);
    const rare = describeKeywordHubRhythm('에어컨', {
      activeDays: 6,
      windowDays: 30,
      topSources: [],
    });
    assert.match(rare?.advice ?? '', /놓치지 않아요/);
    assert.equal(
      describeKeywordHubRhythm('x', { activeDays: 0, windowDays: 30, topSources: [] }),
      null,
    );
  });
});
