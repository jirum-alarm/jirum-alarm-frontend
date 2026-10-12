import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { buildShareCard, buildProductShareDescription, isShareRequest, SHARE_CARD_TITLE_MAX } =
  require('./share-card.ts') as typeof import('./share-card');

describe('buildShareCard', () => {
  it('제목 끝 가격은 떼고 가격 칸에 크게 쓴다', () => {
    const card = buildShareCard({
      title: '햇반 흑미밥 작은공기 130g 6개 3,910원',
      price: '3,910원',
      mallName: '쿠팡',
      badge: '핫딜',
    });
    assert.equal(card.title, '햇반 흑미밥 작은공기 130g 6개');
    assert.equal(card.price, '3,910원');
    assert.equal(card.badge, '핫딜');
    assert.equal(card.ended, false);
  });

  it('토스 유입(hidePrice)은 가격을 비운다', () => {
    assert.equal(
      buildShareCard({ title: '사과 2kg', price: '13,900원', hidePrice: true }).price,
      null,
    );
  });

  it('숫자 없는 가격은 쓰지 않는다', () => {
    assert.equal(buildShareCard({ title: 'a', price: '가격정보 없음' }).price, null);
  });

  it('긴 제목은 말줄임', () => {
    const card = buildShareCard({ title: '가'.repeat(100) });
    assert.equal(card.title.length, SHARE_CARD_TITLE_MAX);
    assert.ok(card.title.endsWith('…'));
  });

  it('가격만 있는 제목은 원문을 지킨다', () => {
    assert.equal(buildShareCard({ title: '12,000원' }).title, '12,000원');
  });
});

describe('buildProductShareDescription', () => {
  it('배지 · 가격 · 쇼핑몰', () => {
    assert.equal(
      buildProductShareDescription({ badge: '대박딜', price: '58,170원', mallName: '지마켓' }),
      '대박딜 · 58,170원 · 지마켓',
    );
  });

  it('종료된 딜은 판매종료, 토스 유입은 가격 없음', () => {
    assert.equal(
      buildProductShareDescription({
        badge: '초대박딜',
        price: '5,590원',
        isEnd: true,
        hidePrice: true,
      }),
      '판매종료',
    );
  });

  it('빈 값이면 undefined', () => {
    assert.equal(buildProductShareDescription({}), undefined);
  });
});

describe('isShareRequest', () => {
  it('utm_source=share 만', () => {
    assert.equal(isShareRequest('share'), true);
    assert.equal(isShareRequest(['share', 'x']), true);
    assert.equal(isShareRequest('kakao'), false);
    assert.equal(isShareRequest(undefined), false);
  });
});
