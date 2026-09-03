import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { withTopicParticle, buildDealsLeadSentence } =
  require('./model-page-insights.ts') as typeof import('./model-page-insights');

type Timing = Parameters<typeof buildDealsLeadSentence>[0]['timing'];

const timing = (over: Partial<Timing> = {}): Timing => ({
  tone: 'good',
  label: '역대급 · 사기 좋은 구간',
  current: 22,
  avg: 151,
  buyLine: 73,
  saveVsAvg: 129,
  savePct: 85,
  basis: 'unit',
  unitLabel: '100ml당',
  packLabel: null,
  totalPrice: 14830,
  activeDealCount: 16,
  ...over,
});

const fmt = (n: number) => `100ml당 ${Math.round(n).toLocaleString('ko-KR')}원`;

describe('withTopicParticle', () => {
  it('종성이 있으면 은', () => {
    assert.equal(withTopicParticle('펩시콜라 제로슈거 라임향'), '펩시콜라 제로슈거 라임향은');
    assert.equal(withTopicParticle('신라면'), '신라면은');
  });

  it('종성이 없으면 는', () => {
    assert.equal(withTopicParticle('제주 삼다수'), '제주 삼다수는');
    assert.equal(withTopicParticle('포카리스웨트'), '포카리스웨트는');
  });

  it('숫자로 끝나면 읽는 소리로 고른다', () => {
    assert.equal(withTopicParticle('RTX 4060'), 'RTX 4060은'); // 영
    assert.equal(withTopicParticle('아이폰 15'), '아이폰 15는'); // 오
    assert.equal(withTopicParticle('갤럭시 S24'), '갤럭시 S24는'); // 사
    assert.equal(withTopicParticle('EOS 6'), 'EOS 6은'); // 육
  });

  it('영문·기호로 끝나면 는', () => {
    assert.equal(withTopicParticle('jonr-p20-pro'), 'jonr-p20-pro는');
  });
});

describe('buildDealsLeadSentence', () => {
  it('적정가를 먼저, 근거를 뒤에 붙인다', () => {
    const s = buildDealsLeadSentence({
      modelName: '펩시콜라 제로슈거 라임향',
      timing: timing(),
      dealCount: 759,
      formatPrice: fmt,
    });
    assert.equal(
      s,
      '펩시콜라 제로슈거 라임향은 100ml당 73원 이하면 사도 되는 가격입니다. ' +
        '최근 핫딜 759건 · 추이 평균 100ml당 151원 · 지금 진행 중 최저가 100ml당 22원 (평균보다 약 85% 저렴).',
    );
  });

  it('적정가가 없으면 근거 문장만 낸다', () => {
    const s = buildDealsLeadSentence({
      modelName: '신라면',
      timing: timing({ buyLine: null, savePct: null, avg: null }),
      dealCount: 12,
      formatPrice: fmt,
    });
    assert.equal(s, '최근 핫딜 12건 · 지금 진행 중 최저가 100ml당 22원.');
  });

  it('평균보다 비쌀 때 "저렴"을 붙이지 않는다', () => {
    const s = buildDealsLeadSentence({
      modelName: '신라면',
      timing: timing({ savePct: -12 }),
      dealCount: 3,
      formatPrice: fmt,
    });
    assert.ok(s);
    assert.ok(!s.includes('저렴'), s);
  });

  it('쓸 수 있는 수치가 하나도 없으면 null — 폴백 문구를 쓰게 한다', () => {
    const s = buildDealsLeadSentence({
      modelName: '신라면',
      timing: timing({ buyLine: null, avg: null, current: 0, savePct: null }),
      dealCount: 0,
      formatPrice: fmt,
    });
    assert.equal(s, null);
  });

  it('모델명이 비면 null', () => {
    assert.equal(
      buildDealsLeadSentence({
        modelName: '   ',
        timing: timing(),
        dealCount: 759,
        formatPrice: fmt,
      }),
      null,
    );
  });

  it('건수는 천 단위 구분자를 넣는다', () => {
    const s = buildDealsLeadSentence({
      modelName: '신라면',
      timing: timing(),
      dealCount: 1234,
      formatPrice: fmt,
    });
    assert.ok(s?.includes('최근 핫딜 1,234건'), s ?? '');
  });
});
