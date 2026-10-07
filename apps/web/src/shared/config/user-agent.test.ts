import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { describe, it } from 'node:test';

const require = createRequire(import.meta.url);
const { isAndroidUA, isLightSsrCrawlerUA } =
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
