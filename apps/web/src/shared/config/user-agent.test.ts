import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { isAndroidUA, isCrawlerUA, isLightSsrCrawlerUA, isLinkPreviewUA, isSafariUA } =
  require('./user-agent.ts') as typeof import('./user-agent');

// 2026-10-02 운영 액세스 로그에서 뽑은 실제 UA.
describe('isLightSsrCrawlerUA', () => {
  it('AI 학습·수집 봇과 SEO 도구는 가벼운 SSR', () => {
    for (const ua of [
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.2; +https://openai.com/gptbot',
      'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
      'Mozilla/5.0 (compatible; ExaSearchBot/1.0; +https://exa.ai)',
      'Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)',
      'Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)',
      'Mozilla/5.0 (compatible; DataForSeoBot/1.0; +https://dataforseo.com/dataforseo-bot)',
    ]) {
      assert.equal(isLightSsrCrawlerUA(ua), true, ua);
    }
  });

  it('검색엔진·사용자 요청 봇·사람은 그대로(사용자 결정)', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
      'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Safari/605.1.15 (Applebot/0.1; +http://www.apple.com/go/applebot)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot',
      'Mozilla/5.0 (compatible; Claude-User/1.0; +Claude-User@anthropic.com)',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      '',
    ]) {
      assert.equal(isLightSsrCrawlerUA(ua), false, ua);
    }
  });
});

// 2026-10-15 운영 게이트웨이 로그.
describe('isLinkPreviewUA', () => {
  it('카톡·페북 링크 미리보기는 차트 없이', () => {
    for (const ua of [
      'facebookexternalhit/1.1; kakaotalk-scrap/1.0; +https://devtalk.kakao.com/t/scrap/33984',
      'facebookexternalhit/1.1;kakaotalk-scrap/1.0; +https://devtalk.kakao.com/t/scrap/33984',
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    ]) {
      assert.equal(isLinkPreviewUA(ua), true, ua);
    }
  });

  it('카톡 인앱 브라우저(사람)·검색엔진은 아님', () => {
    for (const ua of [
      'Mozilla/5.0 (Linux; Android 16; SM-S937N Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/155.0.0.0 Mobile Safari/537.36;KAKAOTALK 2611730',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 26.8.3',
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      '',
    ]) {
      assert.equal(isLinkPreviewUA(ua), false, ua);
    }
  });
});

// 2026-10-08 운영 게이트웨이 로그 — 네이버 앱 인앱(GA4 "Whale Browser")·삼성 인터넷. 둘 다 vendor=Samsung.
describe('isAndroidUA', () => {
  it('네이버 앱·삼성 인터넷·UA 축약 크롬 모두 안드로이드', () => {
    for (const ua of [
      'Mozilla/5.0 (Linux; Android 16; SM-S926N Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/140.0.0.0 Whale/1.0.0.0 Crosswalk/30.140.0.10 Mobile Safari/537.36 NAVER(inapp; search; 2100; 12.23.81)',
      'Mozilla/5.0 (Linux; Android 16; SAMSUNG SM-S926N) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
    ]) {
      assert.equal(isAndroidUA(ua), true, ua);
    }
  });
});

describe('isSafariUA', () => {
  it('iOS 사파리만 사파리 — iOS 크롬·파이어폭스·엣지·웨일과 안드로이드는 아니다', () => {
    const safari =
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
    assert.equal(isSafariUA(safari), true);
    for (const ua of [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/140.0.0.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/140.0 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/140.0 Mobile/15E148 Safari/605.1.15',
      'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36',
    ]) {
      assert.equal(isSafariUA(ua), false, ua);
    }
  });
});

// 2026-10-16 운영 게이트웨이 로그 — crawling-server bot-user-agent.ts 와 같은 판정이어야 한다.
describe('isCrawlerUA', () => {
  it('렌더링 크롤러·광고·AI·미리보기 봇은 크롤러', () => {
    for (const ua of [
      'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.8010.52 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm) Chrome/116.0.1938.76 Safari/537.36',
      'Mozilla/5.0 (compatible; Daum/4.1; +http://cs.daum.net/faq/15/4118.html) Daumoa',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/153.0.0.0 Safari/537.36 (compatible; Google-InspectionTool/1.0)',
      'Mediapartners-Google',
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot',
      'facebookexternalhit/1.1; kakaotalk-scrap/1.0; +https://devtalk.kakao.com/t/scrap/33984',
    ]) {
      assert.equal(isCrawlerUA(ua), true, ua);
    }
  });

  it('사람 브라우저·인앱·우리 앱 웹뷰는 아님', () => {
    for (const ua of [
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',
      'Mozilla/5.0 (Linux; Android 16; SM-S926N Build/BP4A.251205.006; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/140.0.0.0 Whale/1.0.0.0 Crosswalk/30.140.0.10 Mobile Safari/537.36 NAVER(inapp; search; 2100; 12.23.81)',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 26.8.3',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 DaumApps/8.5.0',
      'Mozilla/5.0 (Linux; Android 14) IOS ReactNative Webview Jirum Alarm',
      '',
    ]) {
      assert.equal(isCrawlerUA(ua), false, ua);
    }
  });
});
