import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  matchesKeywordHub,
  findKeywordHubsForTitle,
  findKeywordHubForQuery,
  keywordHubPath,
  buildKeywordHubSeo,
  buildKeywordHubFacts,
  describeKeywordHubRhythm,
  formatHubCount,
  KEYWORD_HUB_MIN_DEALS,
} = require('./keyword-hub.ts') as typeof import('./keyword-hub');

type Terms = import('./keyword-hub').KeywordHubTerms;

const HUBS: Terms[] = [
  { slug: '삼다수', name: '삼다수', aliases: [], excludes: [] },
  { slug: '생수', name: '생수', aliases: [], excludes: [] },
  { slug: '콜라', name: '콜라', aliases: [], excludes: ['콜라겐'] },
  { slug: '햇반', name: '햇반', aliases: [], excludes: [] },
  { slug: '메가커피', name: '메가커피', aliases: ['메가MGC', '메가 MGC'], excludes: [] },
  { slug: '에어팟', name: '에어팟', aliases: [], excludes: ['케이스'] },
  { slug: '아이폰', name: '아이폰', aliases: [], excludes: ['케이스'] },
  {
    slug: '스위치2',
    name: '스위치2',
    aliases: ['스위치 2'],
    excludes: ['멀티탭', '콘센트', '전등'],
  },
  { slug: 'ps5', name: 'PS5', aliases: ['플스5'], excludes: [] },
];

const hub = (slug: string) => {
  const h = HUBS.find((x) => x.slug === slug);
  assert.ok(h, slug);
  return h;
};

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
  it('제목에 걸리는 허브를 최대 n개, 목록 순서대로', () => {
    assert.deepEqual(
      findKeywordHubsForTitle('제주 삼다수 2L 24개 생수', HUBS).map((h) => h.slug),
      ['삼다수', '생수'],
    );
    assert.deepEqual(findKeywordHubsForTitle('아무 상품', HUBS), []);
  });
});

describe('findKeywordHubForQuery', () => {
  it('검색어가 키워드 자체일 때만(대소문자·공백·별칭 무시)', () => {
    assert.equal(findKeywordHubForQuery('PS5', HUBS)?.slug, 'ps5');
    assert.equal(findKeywordHubForQuery('플스 5', HUBS)?.slug, 'ps5');
    assert.equal(findKeywordHubForQuery(' 삼다수 ', HUBS)?.slug, '삼다수');
  });

  it('더 구체적인 검색어·빈 값은 허브가 아니다', () => {
    assert.equal(findKeywordHubForQuery('삼다수 2L', HUBS), undefined);
    assert.equal(findKeywordHubForQuery('', HUBS), undefined);
    assert.equal(findKeywordHubForQuery(null, HUBS), undefined);
  });
});

describe('keywordHubPath', () => {
  it('한글 slug 를 인코딩한다', () => {
    assert.equal(keywordHubPath(hub('삼다수')), '/keywords/%EC%82%BC%EB%8B%A4%EC%88%98');
  });
});

const stats = (recentDealCount: number, extra: Record<string, unknown> = {}) => ({
  name: '삼다수',
  recentDealCount,
  countCapped: false,
  activeDays: 0,
  topSources: [] as { name: string; share: number }[],
  ...extra,
});

describe('formatHubCount', () => {
  it('상한에 걸렸으면 +', () => {
    assert.equal(formatHubCount(stats(76)), '76건');
    assert.equal(formatHubCount(stats(300, { countCapped: true })), '300건+');
  });
});

describe('describeKeywordHubRhythm', () => {
  it('30일 중 70% 이상 올라오면 「거의 매일」, 아니면 알림 권유', () => {
    const often = describeKeywordHubRhythm(
      stats(80, {
        activeDays: 29,
        topSources: [
          { name: '뽐뿌', share: 62 },
          { name: '아카라이브', share: 20 },
        ],
      }),
    );
    assert.equal(often?.headline, '최근 30일 중 29일 올라왔어요');
    assert.match(often?.advice ?? '', /거의 매일/);
    assert.equal(often?.sources, '뽐뿌 62% · 아카라이브 20%');
    assert.match(
      describeKeywordHubRhythm(stats(6, { activeDays: 5 }))?.advice ?? '',
      /매일 올라오지는/,
    );
  });

  it('올라온 날이 없으면 null', () => {
    assert.equal(describeKeywordHubRhythm(stats(0)), null);
  });
});

describe('buildKeywordHubFacts', () => {
  it('「30일 중 M일 · 주로 X N%」', () => {
    assert.deepEqual(
      buildKeywordHubFacts(stats(12, { activeDays: 9, topSources: [{ name: '뽐뿌', share: 62 }] })),
      ['30일 중 9일', '주로 뽐뿌 62%'],
    );
    assert.deepEqual(buildKeywordHubFacts(stats(0)), []);
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
  const samdasoo = (n: number, extra: Record<string, unknown> = {}) =>
    stats(n, { activeDays: n > 0 ? Math.min(n, 30) : 0, ...extra });

  it('제목 = 이름 + 핫딜 모음 + 최근 30일 건수, 설명 첫 문장에 최근 딜(KST 날짜)·올라온 날', () => {
    const seo = buildKeywordHubSeo(samdasoo(12, { activeDays: 10 }), [deal]);
    assert.equal(seo.title, '삼다수 핫딜 모음 · 최근 30일 12건 | 지름알림');
    assert.equal(
      seo.lead,
      '최근 30일 동안 커뮤니티·쇼핑몰 특가에 올라온 삼다수 핫딜 12건을 모았어요. 가장 최근 딜은 제주 삼다수 2L 48통 33,570원(뽐뿌 · 10월 1일).',
    );
    assert.match(seo.description, /최근 30일 중 10일 올라왔어요\./);
    assert.equal(seo.indexable, true);
  });

  it('"가장 최근 딜"은 목록 순서가 아니라 게시일로 고른다(목록은 진행 중 먼저)', () => {
    const older = { ...deal, title: '삼다수 500ml 20병', postedAt: '2026-09-20T00:00:00Z' };
    const seo = buildKeywordHubSeo(samdasoo(6), [older, deal]);
    assert.match(seo.lead, /가장 최근 딜은 제주 삼다수 2L 48통/);
  });

  it(`딜이 ${KEYWORD_HUB_MIN_DEALS}건 미만이면 noindex, 0건이면 건수 없이`, () => {
    assert.equal(buildKeywordHubSeo(samdasoo(1), [deal]).indexable, false);
    const empty = buildKeywordHubSeo(samdasoo(0), []);
    assert.equal(empty.title, '삼다수 핫딜 모음 | 지름알림');
    assert.equal(empty.indexable, false);
    assert.equal(empty.rhythm, null);
  });

  it('최근 딜 제목에 가격이 이미 있으면 다시 붙이지 않는다', () => {
    const seo = buildKeywordHubSeo({ ...samdasoo(6), name: '햇반' }, [
      { ...deal, title: '햇반 루피니빈잡곡밥 12개 14,980원', price: '14,980원' },
    ]);
    assert.match(seo.lead, /12개 14,980원\(뽐뿌/);
  });

  it('최저가 숫자는 제목·설명에 넣지 않는다(원값 오독)', () => {
    const seo = buildKeywordHubSeo(samdasoo(6), [deal]);
    assert.doesNotMatch(`${seo.title} ${seo.description}`, /최저/);
  });
});
