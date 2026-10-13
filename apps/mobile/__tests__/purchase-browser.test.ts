import {Linking} from 'react-native';

import {
  experimentBucket,
  sha256,
} from '../src/shared/lib/experiment/experiment-bucket';
import {
  PURCHASE_WEBVIEW_EXPERIMENT_ID,
  purchaseBrowserArm,
} from '../src/screens/detail/lib/purchase-browser-experiment';
import {
  appSchemeName,
  decidePurchaseNavigation,
  openExternalApp,
  parseIntentUrl,
} from '../src/screens/purchase/lib/purchase-navigation';

jest.mock('@/entities/user/user.queries', () => ({UserQueries: {}}));
jest.mock('@/shared/lib/device/device-id', () => ({getDeviceId: jest.fn()}));

const hex = (bytes: Uint8Array) =>
  Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
const ascii = (text: string) => Uint8Array.from(text, ch => ch.charCodeAt(0));

describe('experimentBucket — 서버(node crypto)와 같은 값', () => {
  // 기대값은 node `crypto.createHash('sha256')` 로 뽑았다(2026-10-13).
  it('sha256 표준 벡터', () => {
    expect(hex(sha256(ascii('')))).toBe(
      'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    );
    expect(hex(sha256(ascii('a')))).toBe(
      'ca978112ca1bbdcafac231b39a23dc4da786eff8147c4e72b9807785afee48bb',
    );
    // 여러 블록(1000바이트)
    expect(hex(sha256(ascii('a'.repeat(1000))))).toBe(
      '41edece42d63e8d9bf515a9ba6932e1c20cbc9f5a5d134645adb5db1b9737ea3',
    );
  });

  it('버킷 = 서버 experimentBucket', () => {
    const id = PURCHASE_WEBVIEW_EXPERIMENT_ID;
    expect(experimentBucket('0b7f6a62-1c1e-4d7a-9f3e-2a7c5d9e8b10', id)).toBe(
      45,
    );
    expect(experimentBucket('a', id)).toBe(14);
    expect(experimentBucket('', id)).toBe(98);
    expect(experimentBucket('가나다-기기', id)).toBe(59); // UTF-8 인코딩까지 같아야 한다
  });
});

describe('purchaseBrowserArm', () => {
  it('버킷 50 미만이면 웹뷰, 이상이면 인앱 브라우저', () => {
    expect(
      purchaseBrowserArm('0b7f6a62-1c1e-4d7a-9f3e-2a7c5d9e8b10', null, 50),
    ).toBe('webview'); // 45
    expect(purchaseBrowserArm('가나다-기기', null, 50)).toBe('in_app_browser'); // 59
  });

  it('기기 id 를 못 읽었으면 지금까지처럼 인앱 브라우저', () => {
    expect(purchaseBrowserArm(null, null, 50)).toBe('in_app_browser');
  });

  it('운영자 계정(me.id 는 문자열)은 늘 웹뷰', () => {
    expect(purchaseBrowserArm('가나다-기기', '9', 50)).toBe('webview');
    expect(purchaseBrowserArm(null, '9', 0)).toBe('webview');
  });

  it('지금 설정(전원 적용) — 버킷·기기 id 와 무관하게 웹뷰', () => {
    expect(purchaseBrowserArm('가나다-기기', null)).toBe('webview');
    expect(purchaseBrowserArm(null, null)).toBe('webview');
  });

  it('0 이면 전원 인앱 브라우저(되돌리기)', () => {
    expect(
      purchaseBrowserArm('0b7f6a62-1c1e-4d7a-9f3e-2a7c5d9e8b10', null, 0),
    ).toBe('in_app_browser');
  });
});

describe('decidePurchaseNavigation', () => {
  const idle = {handedOff: false};

  it('웹 주소는 웹뷰가 연다', () => {
    for (const url of [
      'https://link.coupang.com/a/hK2sTkDK9s',
      'http://example.com',
      'about:blank',
      'about:srcdoc',
      'javascript:void(0)',
    ]) {
      expect(decidePurchaseNavigation({url, isTopFrame: true}, idle)).toEqual({
        kind: 'load',
      });
    }
  });

  it('쇼핑몰 앱 링크는 앱으로 넘긴다(쿠팡·토스·intent)', () => {
    for (const url of [
      'coupang://mlp?flowId=7&rUrl=coupang%3A%2F%2Fmlsdp',
      'supertoss://tosspay?referrer=affiliate&redirect=servicetoss%3A%2F%2F',
      'intent://store.ohou.se/goods/1#Intent;scheme=ohouseapp;package=net.bucketplace;end',
    ]) {
      expect(decidePurchaseNavigation({url, isTopFrame: true}, idle)).toEqual({
        kind: 'app',
        url,
      });
    }
  });

  it('iframe 이 부르는 앱 링크는 막는다(광고·추적)', () => {
    expect(
      decidePurchaseNavigation(
        {url: 'coupang://home', isTopFrame: false},
        idle,
      ),
    ).toEqual({kind: 'block'});
  });

  it('스토어 폴백 — 앱을 아직 못 열었으면 보내고, 이미 열었으면 막는다', () => {
    const url = 'itms-apps://apps.apple.com/KR/app/id839333328?ls=1&mt=8';
    expect(decidePurchaseNavigation({url}, idle)).toEqual({kind: 'store', url});
    expect(decidePurchaseNavigation({url}, {handedOff: true})).toEqual({
      kind: 'block',
    });
    expect(
      decidePurchaseNavigation(
        {url: 'market://details?id=viva.republica.toss'},
        {handedOff: true},
      ),
    ).toEqual({kind: 'block'});
  });
});

describe('parseIntentUrl', () => {
  it('scheme·package·폴백 주소를 꺼낸다', () => {
    expect(
      parseIntentUrl(
        'intent://store.ohou.se/goods/4164876?channel=affiliate#Intent;scheme=ohouseapp;package=net.bucketplace;S.browser_fallback_url=https%3A%2F%2Fstore.ohou.se%2Fgoods%2F4164876;end',
      ),
    ).toEqual({
      appUrl: 'ohouseapp://store.ohou.se/goods/4164876?channel=affiliate',
      packageName: 'net.bucketplace',
      fallbackUrl: 'https://store.ohou.se/goods/4164876',
    });
  });

  it('scheme 이 없으면 앱 주소도 없다', () => {
    expect(
      parseIntentUrl('intent://x#Intent;package=com.foo;end').appUrl,
    ).toBeNull();
  });
});

describe('openExternalApp', () => {
  let openURL: jest.SpyInstance;
  beforeEach(() => {
    openURL = jest.spyOn(Linking, 'openURL');
  });
  afterEach(() => openURL.mockRestore());

  it('앱이 열리면 opened', async () => {
    openURL.mockResolvedValue(true);
    await expect(openExternalApp('coupang://mlp?x=1')).resolves.toEqual({
      opened: true,
      fallbackUrl: null,
    });
    expect(openURL).toHaveBeenCalledWith('coupang://mlp?x=1');
  });

  it('미설치면 opened=false — 웹뷰는 페이지 폴백을 기다린다', async () => {
    openURL.mockRejectedValue(new Error('no app'));
    await expect(openExternalApp('coupang://mlp?x=1')).resolves.toEqual({
      opened: false,
      fallbackUrl: null,
    });
  });

  it('intent: 앱 스킴 먼저, 실패하면 폴백 주소를 돌려준다(스토어로 튀지 않게)', async () => {
    openURL.mockRejectedValue(new Error('no app'));
    const result = await openExternalApp(
      'intent://p/1#Intent;scheme=ohouseapp;package=net.bucketplace;S.browser_fallback_url=https%3A%2F%2Fstore.ohou.se%2Fp%2F1;end',
    );
    expect(openURL).toHaveBeenCalledTimes(1);
    expect(openURL).toHaveBeenCalledWith('ohouseapp://p/1');
    expect(result).toEqual({
      opened: false,
      fallbackUrl: 'https://store.ohou.se/p/1',
    });
  });

  it('intent: 폴백 주소가 없으면 스토어로', async () => {
    openURL.mockRejectedValueOnce(new Error('no app')).mockResolvedValue(true);
    await openExternalApp('intent://p/1#Intent;scheme=foo;package=com.foo;end');
    expect(openURL).toHaveBeenLastCalledWith('market://details?id=com.foo');
  });
});

describe('appSchemeName', () => {
  it('제휴 파라미터 없이 스킴 이름만', () => {
    expect(appSchemeName('coupang://mlp?lptag=secret')).toBe('coupang');
    expect(
      appSchemeName('intent://p#Intent;scheme=ohouseapp;package=x;end'),
    ).toBe('ohouseapp');
  });
});
