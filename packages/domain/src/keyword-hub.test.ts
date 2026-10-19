import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  buildKeywordHubFacts,
  buildKeywordHubLead,
  describeKeywordHubRhythm,
  findKeywordHubForQuery,
  findKeywordHubsForTitle,
  findThemesForHub,
  formatHubCount,
  isKeywordHubToday,
  keywordHubPath,
  splitKeywordHubsByRecency,
} = require('./keyword-hub.ts') as typeof import('./keyword-hub');

const hubs = [
  { slug: 'ps5', name: 'PS5', aliases: ['플스5'] },
  { slug: '삼다수', name: '삼다수', aliases: [] },
];

describe('findKeywordHubForQuery', () => {
  it('키워드 자체일 때만 — 대소문자·공백·별칭은 무시(서버 isKeywordHubQuery 와 같다)', () => {
    assert.equal(findKeywordHubForQuery('PS5', hubs)?.slug, 'ps5');
    assert.equal(findKeywordHubForQuery('플스 5', hubs)?.slug, 'ps5');
    assert.equal(findKeywordHubForQuery(' 삼다수 ', hubs)?.slug, '삼다수');
  });

  it('더 구체적인 말·빈 값은 허브가 아니다', () => {
    assert.equal(findKeywordHubForQuery('ps5 프로', hubs), undefined);
    assert.equal(findKeywordHubForQuery('삼다수 2L', hubs), undefined);
    assert.equal(findKeywordHubForQuery('', hubs), undefined);
    assert.equal(findKeywordHubForQuery(null, hubs), undefined);
  });
});

describe('문장', () => {
  it('건수 — 상한에 걸렸으면 +', () => {
    assert.equal(formatHubCount({ recentDealCount: 76, countCapped: false }), '76건');
    assert.equal(formatHubCount({ recentDealCount: 1300, countCapped: true }), '1,300건+');
  });

  it('요약 조각 「30일 중 M일 · 주로 X N%」', () => {
    assert.deepEqual(buildKeywordHubFacts({ activeDays: 9, topSources: [{ name: '뽐뿌', share: 62 }] }), [
      '30일 중 9일',
      '주로 뽐뿌 62%',
    ]);
    assert.deepEqual(buildKeywordHubFacts({ activeDays: 0, topSources: [] }), []);
  });

  it('리듬 — 21일 이상이면 "거의 매일", 아니면 "매일은 아니다", 0일이면 없음(web 과 같은 문장)', () => {
    const often = describeKeywordHubRhythm({
      name: '삼다수',
      activeDays: 25,
      topSources: [
        { name: '뽐뿌', share: 22 },
        { name: '에펨코리아', share: 16 },
      ],
    });
    assert.equal(often?.headline, '최근 30일 중 25일 올라왔어요');
    assert.equal(
      often?.advice,
      '삼다수 핫딜은 거의 매일 올라와요. 급하지 않다면 알림을 걸어 두고 마음에 드는 딜을 골라도 돼요.',
    );
    assert.equal(often?.sources, '뽐뿌 22% · 에펨코리아 16%');
    const rare = describeKeywordHubRhythm({ name: '닌텐도', activeDays: 20, topSources: [] });
    assert.equal(rare?.advice, '닌텐도 핫딜은 매일 올라오지는 않아요. 알림을 걸어 두면 다음 딜을 놓치지 않아요.');
    assert.equal(rare?.sources, '');
    assert.equal(describeKeywordHubRhythm({ name: 'x', activeDays: 0, topSources: [] }), null);
  });

  it('머리 한 줄 — 건수가 있으면 30일 건수, 없으면 소개만', () => {
    assert.equal(
      buildKeywordHubLead({ name: '삼다수', recentDealCount: 103, countCapped: false }),
      '최근 30일 동안 커뮤니티·쇼핑몰 특가에 올라온 삼다수 핫딜 103건을 모았어요.',
    );
    assert.equal(
      buildKeywordHubLead({ name: '삼다수', recentDealCount: 0, countCapped: false }),
      '커뮤니티·쇼핑몰 특가에 올라오는 삼다수 핫딜을 모아 보여드려요.',
    );
  });

  it('경로는 슬러그를 인코딩한다', () => {
    assert.equal(keywordHubPath({ slug: '삼다수' }), '/keywords/%EC%82%BC%EB%8B%A4%EC%88%98');
  });
});

describe('findKeywordHubsForTitle', () => {
  it('제목에 이름·별칭이 들어 있으면 걸리고, 제외어가 있으면 빠진다', () => {
    const terms = [
      { slug: '콜라', name: '콜라', excludes: ['콜라겐'] },
      { slug: 'ps5', name: 'PS5', aliases: ['플스5'] },
    ];
    assert.deepEqual(findKeywordHubsForTitle('코카콜라 제로 24캔', terms).map((h) => h.slug), ['콜라']);
    assert.deepEqual(findKeywordHubsForTitle('저분자 콜라겐 30포', terms), []);
    assert.deepEqual(findKeywordHubsForTitle('[쿠팡] 플스 5 슬림', terms).map((h) => h.slug), ['ps5']);
  });

  // 서버 hubExcludeHit 와 같은 규칙 — 2026-10-20 30일 제목 리플레이에서 진짜 딜인데 빠지던 것
  it('«본품 + 부속»의 부속 쪽 제외어로는 빠지지 않는다 — 본품 부분이 허브 이름을 부를 때', () => {
    const coffee = [{ slug: '커피', name: '커피', excludes: ['머그', '증정', '머신'] }];
    const galaxy = [{ slug: '갤럭시', name: '갤럭시', excludes: ['충전기', '케이스'] }];
    const cola = [{ slug: '콜라', name: '콜라', excludes: ['프라이', '+콜라'] }];
    const hit = (title: string, list: typeof coffee) => findKeywordHubsForTitle(title, list).length;
    assert.equal(hit('스타벅스 캡슐커피 90캡슐+머그 증정 (53,460원/무배)', coffee), 1);
    assert.equal(hit('스타벅스 캡슐커피 5+4박스 골라담기 (머그 증정)', coffee), 1);
    assert.equal(hit('갤럭시탭 S12 플러스 + 삼성전자 45W 충전기', galaxy), 1);
    assert.equal(hit('코카콜라 190ml 30캔 + 스프라이트 제로 24캔', cola), 1);
    // 본품 부분에 제외어가 있거나, 본품이 허브를 안 부르거나, 모델 이름의 «+» 는 그대로 빠진다
    assert.equal(hit('돌체구스토 커피머신 지니오 S + 스타벅스 캡슐 1박스', coffee), 0);
    assert.equal(hit('크리넥스 3겹 24롤 2팩+메가커피 2천원 증정', coffee), 0);
    assert.equal(hit('갤럭시탭 s10fe+ 북커버 케이스(30,000원/무료)', galaxy), 0);
    assert.equal(hit('BHC치킨+콜라1.25L 17,480원', cola), 0);
  });
});

describe('findThemesForHub', () => {
  const themes = [
    { id: 1, keywords: ['SSD', '그래픽카드'] },
    { id: 2, keywords: ['플스5', '닌텐도'] },
    { id: 3, keywords: ['삼다수 2L'] },
  ];
  it('테마 키워드가 허브 키워드 자체(별칭 포함)일 때만 잇는다', () => {
    assert.deepEqual(findThemesForHub(hubs[0], themes).map((t) => t.id), [2]);
    assert.deepEqual(findThemesForHub(hubs[1], themes), []);
  });
});

describe('splitKeywordHubsByRecency', () => {
  const now = Date.parse('2026-10-20T12:00:00Z');
  const hours = (h: number) => new Date(now - h * 3_600_000).toISOString();

  it('마지막 딜이 사흘 안이면 live, 아니거나 없으면 quiet — 서버 순서는 그대로', () => {
    const { live, quiet } = splitKeywordHubsByRecency(
      [
        { slug: 'a', lastDealAt: hours(2) },
        { slug: 'b', lastDealAt: hours(80) },
        { slug: 'c', lastDealAt: null },
        { slug: 'd', lastDealAt: hours(71) },
      ],
      now,
    );
    assert.deepEqual(live.map((h) => h.slug), ['a', 'd']);
    assert.deepEqual(quiet.map((h) => h.slug), ['b', 'c']);
  });

  it('하루 안이면 오늘(강조)', () => {
    assert.equal(isKeywordHubToday(hours(23), now), true);
    assert.equal(isKeywordHubToday(hours(25), now), false);
  });
});
