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
      '최근 30일 동안 커뮤니티에 올라온 삼다수 핫딜 12건을 모았어요. 가장 최근 딜은 제주 삼다수 2L 48통 33,570원(뽐뿌 · 10월 1일).',
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
