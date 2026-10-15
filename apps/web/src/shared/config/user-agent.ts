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

/** 카카오톡 인앱 브라우저 — 카톡방 링크가 열리는 곳. 웹 푸시가 안 되고 크롬·사파리와 저장소도 따로다. */
export const isKakaoInAppUA = (ua: string) => /KAKAOTALK/i.test(ua);

/**
 * 안드로이드 기기. ua-parser 의 device.vendor 로 보면 안 된다 — 삼성 폰은 'Samsung' 이라
 * 네이버 앱(GA4 "Whale Browser", 안드로이드 최대 유입)이 안드로이드가 아닌 것으로 판정돼
 * 휴대폰에 PC용 QR 모달이 떴다(2026-10 실측: 3일 1,035회).
 */
export const isAndroidUA = (ua: string) => /Android/i.test(ua);

/** 지름알림 앱 웹뷰(RN·옛 Flutter). agent.ts·useDevice 의 isJirumAlarmApp 과 같은 판정. */
export const isJirumAlarmAppUA = (ua: string) =>
  /(IOS|Android) (ReactNative|Flutter) Webview Jirum Alarm/i.test(ua);

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

/**
 * 링크 미리보기 봇 — 카톡·페북·슬랙 등에 링크가 올라오면 카드(og 태그)만 읽어 간다(2026-10-15).
 *
 * ★왜: 하루 ~1.9만 건(대부분 우리 카톡 발송봇이 단톡방에 올린 딜을 kakaotalk-scrap 이 읽는 것)인데
 * 본문 SSR 까지 사람과 똑같이 받아 p50 0.27s 였다. 카드에 쓰는 메타(설명의 근거 문장 포함)는 그대로 두고
 * 본문용 730일 가격 차트만 SSR 에서 뺀다. 카톡 인앱 브라우저(UA 의 KAKAOTALK)는 사람이라 걸리지 않는다.
 */
export const LINK_PREVIEW_PATTERN =
  /kakaotalk-scrap|facebookexternalhit|Twitterbot|Slackbot|Discordbot|TelegramBot|WhatsApp\/|LinkedInBot/i;

export const isLinkPreviewUA = (ua: string) => LINK_PREVIEW_PATTERN.test(ua);

/**
 * 모든 크롤러(검색엔진 포함) — crawling-server `src/common/lib/bot-user-agent.ts` 의 BOT_USER_AGENT 와 같은 식.
 * 서버는 이 봇들의 조회·노출 기록을 버리고, 웹은 브라우저에서 그 기록 요청 자체를 보내지 않는다.
 *
 * ★왜(2026-10-16): Googlebot·Yeti 는 상세를 렌더링하며 조회·노출 기록 뮤테이션과 첫 방문 시트·쿠팡 버튼 조회를
 * 부른다. 게이트웨이 로그에서 Googlebot 요청의 60%·Yeti 의 62% 가 상품 페이지가 아니라 이 POST /api/graphql 였다.
 * 렌더링 중 XHR 도 크롤 예산을 쓴다(구글 크롤 예산 문서) — 그 사이 10/2 이후 올라온 딜은 표본 36개 전부
 * 구글이 「아직 알지 못하는 URL」이었다. 사람이 아닌 걸 아는 화면 요소(시트·실험 버튼)도 같이 뺀다.
 * ⚠️ 본문을 채우는 조회(관련 상품·댓글 등 내부 링크)는 막지 않는다 — 봇이 보는 화면은 사람과 같아야 한다.
 */
const CRAWLER_PATTERN =
  /(?:bot|crawler|spider)(?![a-z])|Yeti\/|Daumoa|Mediapartners-Google|GoogleOther|Google-InspectionTool|Google-Read-Aloud|Storebot-Google|HeadlessChrome|Lighthouse|facebookexternalhit|meta-externalagent|kakaotalk-scrap|Slurp|Bytespider/i;

export const isCrawlerUA = (ua: string) => CRAWLER_PATTERN.test(ua);

/** 브라우저에서 지금 크롤러가 렌더링 중인가. 서버(navigator 없음)에선 false. */
export const isCrawlerBrowser = () =>
  typeof navigator !== 'undefined' && isCrawlerUA(navigator.userAgent);
