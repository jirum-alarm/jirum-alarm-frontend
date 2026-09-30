import {
  buildCaption,
  buildIntentUrl,
  buildKakaoLinkUrl,
  buildProductShareUrl,
  buildShareMessage,
  buildShareUrl,
  fetchKakaoScrap,
  KAKAO_NATIVE_APP_KEY,
  type KakaoScrap,
} from '../src/shared/lib/share';

declare const __dirname: string;

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
  it('★Android 도 kakaolink 로 보낸다 — intent: 문자열은 RN openURL 이 못 연다', () => {
    // RN Android Linking.openURL = Intent(ACTION_VIEW, Uri.parse(url)). `intent:#Intent;...`
    // 를 파싱하지 않아 받을 앱이 없다(예전 Android 경로가 토스트로만 떨어진 원인).
    const fs = require('fs');
    const path = require('path');
    const sheet: string = fs.readFileSync(
      path.join(__dirname, '../src/screens/detail/ui/ShareSheet.tsx'),
      'utf8',
    );
    expect(sheet).toContain(
      'await Linking.openURL(buildKakaoLinkUrl(await fetchKakaoScrap(url)))',
    );
    expect(sheet).not.toContain('buildKakaoAndroidSendIntent');
    expect(sheet).not.toContain("Platform.OS === 'android'");
  });

  const scrap: KakaoScrap = {
    template_id: 3138,
    template_args: {'${SCRAP_TITLE}': '브리타 필터 | 지름알림'},
    template_msg: {P: {TP: 'Feed'}, C: {BUL: []}},
  };

  /**
   * 🔴 회귀 가드 — 두 번 틀린 자리. kakaolink 는 scrap API 가 검증한 카드를
   * template_json·template_args·template_id 로 받는다(카카오 JS SDK 2.7.7 KakaoLink).
   * request_url 은 scrap API 의 파라미터라 kakaolink 에 실으면 카톡이 무시한다.
   */
  it('scrap 응답을 template_json·template_args·template_id 로 싣는다', () => {
    const out = buildKakaoLinkUrl(scrap);
    expect(out.startsWith('kakaolink://send?')).toBe(true);
    expect(queryParam(out, 'appkey')).toBe(KAKAO_NATIVE_APP_KEY);
    expect(queryParam(out, 'linkver')).toBe('4.0');
    expect(JSON.parse(queryParam(out, 'template_json')!)).toEqual(
      scrap.template_msg,
    );
    expect(JSON.parse(queryParam(out, 'template_args')!)).toEqual(
      scrap.template_args,
    );
    expect(queryParam(out, 'template_id')).toBe('3138');
    expect(queryParam(out, 'request_url')).toBeNull();
  });

  it('scrap API 가 거부하면 던진다 — 빈 카드로 카톡을 열지 않는다', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({msg: 'mismatched!', code: -401}),
    });
    (globalThis as {fetch: unknown}).fetch = fetchMock;
    await expect(
      fetchKakaoScrap('https://jirum-alarm.com/products/1'),
    ).rejects.toThrow('mismatched!');
    const [calledUrl, init] = fetchMock.mock.calls[0] as [
      string,
      {headers: Record<string, string>},
    ];
    expect(queryParam(calledUrl, 'request_url')).toBe(
      'https://jirum-alarm.com/products/1',
    );
    expect(init.headers.Authorization).toBe(`KakaoAK ${KAKAO_NATIVE_APP_KEY}`);
  });
});
