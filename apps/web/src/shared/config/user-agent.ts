/**
 * UA 판정 정규식 — 서버(app/actions/agent.ts)와 클라이언트(shared/hooks/useDevice.ts)가
 * 같은 값을 내야 하므로 여기 한 곳에 둔다. 한쪽만 고치면 하이드레이션 직후
 * 판정이 뒤집혀 그 컴포넌트가 한 프레임 다른 걸 그린다.
 */

/**
 * 카톡·인스타 등 인앱 브라우저.
 * UA 에 Safari 가 붙어 isSafari 로 잡히지만 네이티브 Smart App Banner 는
 * 뜨지 않으므로, "사파리니까 앱 배너 빼자" 판단에서 제외해야 한다.
 */
export const IN_APP_BROWSER_PATTERN = /KAKAOTALK|Instagram|Threads|FB[AS]V|Line\/|NAVER|DaumApps/i;

export const isInAppBrowserUA = (ua: string) => IN_APP_BROWSER_PATTERN.test(ua);

/**
 * 안드로이드 기기. ua-parser 의 device.vendor 로 보면 안 된다 — 삼성 폰은 'Samsung' 이라
 * 네이버 앱(GA4 "Whale Browser", 안드로이드 최대 유입)이 안드로이드가 아닌 것으로 판정돼
 * 휴대폰에 PC용 QR 모달이 떴다(2026-10 실측: 3일 1,035회).
 */
export const isAndroidUA = (ua: string) => /Android/i.test(ua);

/**
 * 진짜 사파리. iOS 의 크롬·파이어폭스·엣지·웨일도 UA 에 Safari 가 붙지만 Chrome 은 없다(CriOS 등)
 * — 서버가 `/Safari/ && !/Chrome/` 만 봐서 이들을 사파리로 판정해 홈 앱 설치 슬라이드를 숨겼다.
 */
export const isSafariUA = (ua: string) =>
  /Safari/i.test(ua) && !/Chrome|CriOS|FxiOS|OPiOS|EdgiOS|Whale/i.test(ua);

/**
 * 상품 상세 SSR 을 가볍게 받을 크롤러 — AI 학습·수집 봇과 SEO 분석 도구(2026-10-02).
 *
 * ★왜: 상품 상세 요청의 ~75% 가 봇이고, crawling-server 처리 시간의 56% 가 가격 이력 730일(차트)·
 * 가격 판정(히어로 배지) 두 개였다. 둘 다 사람용 화면 요소라 이 봇들에겐 SSR 에서 뺀다(차트는 원래
 * 클라이언트 useQuery, 배지는 prop 이 없으면 안 그린다). SEO 메타·본문·90일 가격 요약·내부 링크는 그대로.
 *
 * ⚠️ 검색엔진(Googlebot·bingbot·Yeti·Applebot·OAI-SearchBot 등)과 사용자 요청 봇(ChatGPT-User·Claude-User·
 * Perplexity-User)은 **넣지 않는다** — 사람과 같은 HTML(사용자 결정 2026-10-02). 봇 차단은 안 한다.
 */
export const LIGHT_SSR_CRAWLER_PATTERN =
  /ClaudeBot|anthropic-ai|GPTBot|CCBot|Bytespider|meta-externalagent|ExaSearchBot|Amazonbot|AhrefsBot|SemrushBot|DataForSeoBot|MJ12bot|DotBot|BLEXBot/i;

export const isLightSsrCrawlerUA = (ua: string) => LIGHT_SSR_CRAWLER_PATTERN.test(ua);
