import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { buildProductBreadcrumbItems, buildProductItemPageJsonLd } =
  require('./product-structured-data.ts') as typeof import('./product-structured-data');
const { categoryRankingPath } =
  require('../../../shared/config/category-ranking.ts') as typeof import('../../../shared/config/category-ranking');

const SERVICE = 'https://jirum-alarm.com';

describe('categoryRankingPath', () => {
  it('카테고리 id = 랭킹 탭', () => {
    assert.equal(categoryRankingPath(2), '/trending/ranking?tab=2');
    assert.equal(categoryRankingPath(12), '/trending/ranking?tab=12');
  });

  it('전체(0)·없는 탭·빈 값은 링크하지 않는다', () => {
    for (const id of [0, 13, -1, 2.5, null, undefined, Number.NaN]) {
      assert.equal(categoryRankingPath(id), null, String(id));
    }
  });
});

describe('buildProductBreadcrumbItems', () => {
  it('카테고리만 있으면 3단 — 매핑 안 된 대부분의 상품', () => {
    const items = buildProductBreadcrumbItems({
      serviceUrl: SERVICE,
      productId: 35426139,
      productTitle: '시크릿데이 오버나이트 29,660원',
      category: { name: '생활/식품', path: categoryRankingPath(2) },
    });
    assert.deepEqual(items, [
      { name: '지름알림', item: SERVICE },
      { name: '생활/식품 핫딜', item: `${SERVICE}/trending/ranking?tab=2` },
      { name: '시크릿데이 오버나이트 29,660원', item: `${SERVICE}/products/35426139` },
    ]);
  });

  it('모델 페이지까지 있으면 4단', () => {
    const items = buildProductBreadcrumbItems({
      serviceUrl: SERVICE,
      productId: 1,
      productTitle: '햇반 210g 36개',
      category: { name: '생활/식품', path: categoryRankingPath(2) },
      modelPage: { name: 'CJ제일제당 햇반', slug: 'cj-햇반' },
    });
    assert.deepEqual(
      items.map((i) => i.name),
      ['지름알림', '생활/식품 핫딜', 'CJ제일제당 햇반 핫딜 모음', '햇반 210g 36개'],
    );
    assert.equal(items[2].item, `${SERVICE}/deals/cj-햇반`);
  });

  it('카테고리 허브가 없는 카테고리(전체·이름 없음)는 단계를 뺀다', () => {
    const noPath = buildProductBreadcrumbItems({
      serviceUrl: SERVICE,
      productId: 1,
      productTitle: 'x',
      category: { name: '기타', path: categoryRankingPath(0) },
    });
    const noName = buildProductBreadcrumbItems({
      serviceUrl: SERVICE,
      productId: 1,
      productTitle: 'x',
      category: { name: ' ', path: categoryRankingPath(2) },
    });
    assert.equal(noPath.length, 2);
    assert.equal(noName.length, 2);
  });
});

describe('buildProductItemPageJsonLd', () => {
  it('게시일·원문 출처·Product 연결', () => {
    const ld = buildProductItemPageJsonLd({
      serviceUrl: SERVICE,
      productId: 35426139,
      name: '상품',
      description: '설명',
      postedAt: '2026-10-14T03:01:51.000Z',
      image: 'https://cdn.jirum-alarm.com/a.webp',
      sourceUrl: 'https://cafe.naver.com/f-e/cafes/29434212/articles/14942284',
    });
    assert.equal(ld['@type'], 'ItemPage');
    assert.equal(ld['@id'], `${SERVICE}/products/35426139#webpage`);
    assert.equal(ld.datePublished, '2026-10-14T03:01:51.000Z');
    assert.equal(ld.isBasedOn, 'https://cafe.naver.com/f-e/cafes/29434212/articles/14942284');
    assert.deepEqual(ld.mainEntity, { '@id': `${SERVICE}/products/35426139#product` });
    assert.deepEqual(ld.breadcrumb, { '@id': `${SERVICE}/products/35426139#breadcrumb` });
    // 사이트는 레이아웃의 WebSite 블록 하나를 가리킨다(블록마다 새로 선언하면 엔티티가 갈린다).
    assert.deepEqual(ld.isPartOf, { '@id': `${SERVICE}/#website` });
    assert.deepEqual(ld.primaryImageOfPage, {
      '@type': 'ImageObject',
      url: 'https://cdn.jirum-alarm.com/a.webp',
    });
  });

  it('깨진 날짜·http 가 아닌 원문은 싣지 않는다', () => {
    const ld = buildProductItemPageJsonLd({
      serviceUrl: SERVICE,
      productId: 1,
      name: '상품',
      postedAt: 'not-a-date',
      sourceUrl: 'javascript:alert(1)',
    });
    assert.equal('datePublished' in ld, false);
    assert.equal('isBasedOn' in ld, false);
    assert.equal('description' in ld, false);
    assert.equal('primaryImageOfPage' in ld, false);
  });
});
