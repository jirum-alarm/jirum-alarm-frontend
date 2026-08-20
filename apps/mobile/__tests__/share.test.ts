import {Platform} from 'react-native';

import {
  buildCaption,
  buildIntentUrl,
  buildKakaoAndroidSendIntent,
  buildKakaoLinkUrl,
  buildProductShareUrl,
  buildShareMessage,
  buildShareUrl,
  KAKAO_NATIVE_APP_KEY,
} from '../src/shared/lib/share';

function queryParam(url: string, key: string) {
  const match = url.match(new RegExp(`[?&]${key}=([^&#]*)`));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

describe('buildShareUrl', () => {
  it('유입 utm 을 제거하고 채널 utm 으로 교체', () => {
    const out = buildShareUrl(
      'https://a.com/p/1?utm_source=kakao&utm_medium=broadcast&id=9',
      'x',
    );
    expect(queryParam(out, 'utm_source')).toBe('share');
    expect(queryParam(out, 'utm_medium')).toBe('x');
    expect(queryParam(out, 'id')).toBe('9');
  });

  it('native 채널만 native_share 로 표기', () => {
    expect(
      queryParam(buildShareUrl('https://a.com/p/1', 'native'), 'utm_medium'),
    ).toBe('native_share');
    expect(
      queryParam(buildShareUrl('https://a.com/p/1', 'copy'), 'utm_medium'),
    ).toBe('copy');
  });
});

describe('buildProductShareUrl', () => {
  it('상품 경로에 채널 utm 을 붙인다', () => {
    const out = buildProductShareUrl(12, 'kakao');
    expect(out.includes('/products/12')).toBe(true);
    expect(queryParam(out, 'utm_source')).toBe('share');
    expect(queryParam(out, 'utm_medium')).toBe('kakao');
  });
});

describe('buildShareMessage', () => {
  it('설명이 있으면 제목·설명·링크 3줄', () => {
    expect(
      buildShareMessage(
        '에어팟 | 지름알림',
        'https://a.com/1',
        '129,000원 · 쿠팡',
      ),
    ).toBe('에어팟 | 지름알림\n129,000원 · 쿠팡\nhttps://a.com/1');
  });

  it('링크는 항상 마지막 줄', () => {
    const msg = buildShareMessage('t', 'https://a.com/1', '9,900원');
    expect(msg.split('\n').at(-1)).toBe('https://a.com/1');
  });
});

describe('buildIntentUrl', () => {
  it('x 는 본문에 링크를 넣지 않는다', () => {
    const out = buildIntentUrl(
      'x',
      buildCaption('에어팟', '129,000원'),
      'https://a.com/1',
    );
    expect((queryParam(out, 'text') ?? '').includes('https://a.com/1')).toBe(
      false,
    );
    expect(queryParam(out, 'url')).toBe('https://a.com/1');
  });

  it('스레드는 url 파라미터가 없어 본문에 합친다', () => {
    const out = buildIntentUrl(
      'threads',
      buildCaption('에어팟'),
      'https://a.com/1',
    );
    expect((queryParam(out, 'text') ?? '').includes('https://a.com/1')).toBe(
      true,
    );
  });
});

describe('kakao native schemes', () => {
  it('Android SEND 인텐트는 카톡 패키지로 바로 간다', () => {
    const out = buildKakaoAndroidSendIntent('제목\nhttps://a.com/1');
    expect(out.startsWith('intent:#Intent;')).toBe(true);
    expect(out.includes('package=com.kakao.talk')).toBe(true);
    expect(out.includes('android.intent.action.SEND')).toBe(true);
    expect(out.includes(encodeURIComponent('제목\nhttps://a.com/1'))).toBe(
      true,
    );
  });

  it('kakaolink 는 앱키와 request_url 을 담는다 (scrap)', () => {
    Object.defineProperty(Platform, 'OS', {value: 'ios'});
    const out = buildKakaoLinkUrl({
      url: 'https://jirum-alarm.com/products/1',
    });
    expect(out.startsWith('kakaolink://send?')).toBe(true);
    expect(queryParam(out, 'appkey')).toBe(KAKAO_NATIVE_APP_KEY);
    expect(queryParam(out, 'request_url')).toBe(
      'https://jirum-alarm.com/products/1',
    );
  });

  /**
   * 🔴 회귀 가드: template_json 에 손으로 만든 카드를 실어 보내면 카톡이
   * "core parameter(s) missing" 으로 거부한다(실제 사고). kakaolink 규격에
   * template_json 이라는 파라미터는 없다.
   */
  it('template_json 을 쓰지 않는다 — 카톡이 거부하는 파라미터', () => {
    const out = buildKakaoLinkUrl({
      url: 'https://jirum-alarm.com/products/1',
    });
    expect(out).not.toContain('template_json');
    // 카드를 손조립하지 않으므로 템플릿 본문도 실리지 않는다.
    expect(decodeURIComponent(out)).not.toContain('object_type');
  });
});
