import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  buildKeywordHubFacts,
  buildKeywordHubLead,
  describeKeywordHubRhythm,
  findKeywordHubForQuery,
  formatHubCount,
  keywordHubPath,
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
