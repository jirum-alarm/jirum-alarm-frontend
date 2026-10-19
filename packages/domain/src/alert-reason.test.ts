import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { describeAlertReason, parseAlertReason } = require('./alert-reason.ts') as typeof import('./alert-reason');

describe('parseAlertReason', () => {
  it('키워드 알림 URL — 핫딜·가격 하락 표시까지', () => {
    assert.deepEqual(
      parseAlertReason(
        '/products/1?utm_source=notification&utm_medium=keyword&utm_campaign=keyword_alert&utm_content=%EC%97%90%EC%96%B4%ED%8C%9F&utm_term=price_drop',
      ),
      { kind: 'keyword', keyword: '에어팟', hot: false, priceDrop: true },
    );
    assert.equal(
      (parseAlertReason('utm_source=notification&utm_medium=keyword&utm_campaign=keyword_hot&utm_content=ssd') as { hot: boolean }).hot,
      true,
    );
  });

  it('관심사·좋은 딜', () => {
    assert.deepEqual(
      parseAlertReason('?utm_source=notification&utm_medium=theme&utm_campaign=theme_digest&utm_content=72'),
      { kind: 'theme', themeId: '72' },
    );
    assert.deepEqual(
      parseAlertReason('?utm_source=notification&utm_medium=push&utm_campaign=good_deal'),
      { kind: 'good_deal' },
    );
  });

  it('알림이 아니거나 확인 알림이면 없음', () => {
    assert.equal(parseAlertReason('?utm_source=kakao&utm_medium=notification&utm_campaign=hotdeal_only'), null);
    assert.equal(
      parseAlertReason('?utm_source=notification&utm_medium=keyword&utm_campaign=keyword_confirm&utm_content=x'),
      null,
    );
    assert.equal(parseAlertReason('/products/1'), null);
    assert.equal(parseAlertReason(null), null);
  });
});

describe('describeAlertReason', () => {
  it('문구', () => {
    assert.equal(
      describeAlertReason({ kind: 'keyword', keyword: '에어팟', hot: true, priceDrop: false })?.text,
      "'에어팟' 키워드 알림으로 왔어요 · 핫딜이 돼서",
    );
    assert.equal(
      describeAlertReason({ kind: 'theme', themeId: '3' }, [{ id: 3, name: 'PC·노트북·부품' }])?.text,
      '「PC·노트북·부품」 관심사 알림으로 왔어요',
    );
    assert.equal(describeAlertReason({ kind: 'theme', themeId: '9' }, []), null);
  });
});
