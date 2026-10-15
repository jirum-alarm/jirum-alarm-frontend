import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const {
  buildPostPurchasePromptQueue,
  OKACHAT_ANDROID_INTENT,
  OKACHAT_LINK,
  OKACHAT_IOS_DIRECT_FROM,
  okachatAndroidIntent,
  okachatDirectPlatform,
  okachatJoinScheme,
  shouldShowOkachatSoftPrompt,
} = require('./okachat.ts') as typeof import('./okachat');

describe('shouldShowOkachatSoftPrompt', () => {
  it('오카방 UTM 유입이면 숨긴다', () => {
    assert.equal(shouldShowOkachatSoftPrompt({ fromKakao: true, joined: false }), false);
  });

  it('이미 입장했으면 숨긴다', () => {
    assert.equal(shouldShowOkachatSoftPrompt({ fromKakao: false, joined: true }), false);
  });

  it('그 외 방문자에게는 보인다', () => {
    assert.equal(shouldShowOkachatSoftPrompt({ fromKakao: false, joined: false }), true);
  });
});

describe('buildPostPurchasePromptQueue', () => {
  it('오카방 유입이면 키워드만', () => {
    assert.deepEqual(buildPostPurchasePromptQueue(false, { fromKakao: true, joined: false }), [
      'keyword',
    ]);
  });

  it('이미 입장했으면 키워드만', () => {
    assert.deepEqual(buildPostPurchasePromptQueue(true, { fromKakao: false, joined: true }), [
      'keyword',
    ]);
  });

  it('비로그인은 오카방 → 키워드', () => {
    assert.deepEqual(buildPostPurchasePromptQueue(false, { fromKakao: false, joined: false }), [
      'kakao',
      'keyword',
    ]);
  });

  it('로그인은 키워드 → 오카방', () => {
    assert.deepEqual(buildPostPurchasePromptQueue(true, { fromKakao: false, joined: false }), [
      'keyword',
      'kakao',
    ]);
  });
});

describe('okachatDirectPlatform', () => {
  const NAVER_APP =
    'Mozilla/5.0 (Linux; Android 16; SM-S926N Build/BP2A; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/140.0.0.0 Whale/1.0.0.0 Crosswalk/28.140.0.0 Mobile Safari/537.36 NAVER(inapp; search; 2100; 12.16.2)';
  const SAMSUNG =
    'Mozilla/5.0 (Linux; Android 14; SM-S926N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/26.0 Chrome/122.0.0.0 Mobile Safari/537.36';
  const IOS_SAFARI =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1';
  const DESKTOP =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';
  const BEFORE_IOS: number = OKACHAT_IOS_DIRECT_FROM - 1;
  const AFTER_IOS: number = OKACHAT_IOS_DIRECT_FROM;

  it('안드로이드 브라우저·네이버 앱 인앱은 intent 로 바로 연다', () => {
    assert.equal(okachatDirectPlatform(SAMSUNG, BEFORE_IOS), 'android');
    assert.equal(okachatDirectPlatform(NAVER_APP, BEFORE_IOS), 'android');
  });

  it('iPhone 은 안드로이드 실험 판정 다음 날(10/27 KST)부터 스킴으로 연다', () => {
    assert.equal(OKACHAT_IOS_DIRECT_FROM, Date.parse('2026-10-26T15:00:00Z'));
    assert.equal(okachatDirectPlatform(IOS_SAFARI, BEFORE_IOS), null);
    assert.equal(okachatDirectPlatform(IOS_SAFARI, AFTER_IOS), 'ios');
  });

  it('PC 는 기존 링크 그대로', () => {
    assert.equal(okachatDirectPlatform(DESKTOP, AFTER_IOS), null);
  });

  it('지름알림 앱 웹뷰는 제외', () => {
    assert.equal(
      okachatDirectPlatform(`${SAMSUNG} Android ReactNative Webview Jirum Alarm`, AFTER_IOS),
      null,
    );
    assert.equal(
      okachatDirectPlatform(`${IOS_SAFARI} IOS ReactNative Webview Jirum Alarm`, AFTER_IOS),
      null,
    );
  });
});

describe('okachatJoinScheme', () => {
  it('중간 페이지 「참여하기」와 같은 스킴', () => {
    assert.equal(okachatJoinScheme(OKACHAT_LINK), 'kakaoopen://join?l=gJZTWAAg&r=EW');
  });

  it('오픈채팅 방 링크가 아니면 null — 그냥 링크로 보낸다', () => {
    assert.equal(okachatJoinScheme('https://example.com/o/abc'), null);
    assert.equal(okachatJoinScheme(''), null);
  });
});

describe('OKACHAT_ANDROID_INTENT', () => {
  it('카톡이 없으면 기존 중간 페이지로 돌아간다', () => {
    assert.ok(OKACHAT_ANDROID_INTENT.startsWith('intent://join?l=gJZTWAAg'));
    assert.ok(OKACHAT_ANDROID_INTENT.includes('package=com.kakao.talk'));
    assert.ok(
      OKACHAT_ANDROID_INTENT.includes(
        `S.browser_fallback_url=${encodeURIComponent(OKACHAT_LINK)};`,
      ),
    );
  });
});

describe('okachatAndroidIntent', () => {
  it('핫딜방 링크면 기존 intent 와 같다', () => {
    assert.equal(okachatAndroidIntent(OKACHAT_LINK), OKACHAT_ANDROID_INTENT);
  });

  it('다른 방은 그 방 코드·링크로 만든다', () => {
    const link = 'https://open.kakao.com/o/abcXYZ12';
    const intent = okachatAndroidIntent(link);
    assert.ok(intent?.startsWith('intent://join?l=abcXYZ12&'));
    assert.ok(intent?.includes(`S.browser_fallback_url=${encodeURIComponent(link)};`));
  });

  it('오픈채팅 방 링크가 아니면 null — 그냥 링크로 보낸다', () => {
    assert.equal(okachatAndroidIntent('https://example.com/o/abc'), null);
    assert.equal(okachatAndroidIntent('https://open.kakao.com/me/abc'), null);
    assert.equal(okachatAndroidIntent(''), null);
  });
});
