/**
 * 키워드 허브(web `/keywords/{slug}`·앱 KeywordHubScreen) — "삼다수 핫딜" 같은 검색어 그대로의 모음.
 * 목록·통계의 주인은 서버(crawling-server keyword_hub)고, 여기는 그 값을 읽어 **같은 문장**을 만드는 순수 규칙만 둔다.
 * 웹·앱이 같은 숫자·같은 말을 해야 하므로 한쪽에 복사하지 말고 여기서 import 한다.
 *
 * 2026-10-17 앱 허브 화면을 만들며 옮겼다. web `entities/keyword-hub/lib/keyword-hub.ts` 는 이걸 다시 내보내고 SEO 문장만 덧붙인다.
 *
 * 가격은 쓰지 않는다: 같은 키워드라도 다른 상품·묶음이 섞여(생수 500ml 와 2L) "최저 N원" 은 틀린 주장이 된다.
 */

export type KeywordHubTerms = {
  slug: string;
  name: string;
  aliases?: readonly string[] | null;
};

export type KeywordHubCount = {
  /** 최근 30일 올라온 딜 수(종료 포함). */
  recentDealCount: number;
  /** 수집 상한에 걸려 실제보다 적게 셌다 — "N건+". */
  countCapped: boolean;
};

export type KeywordHubRhythm = {
  name: string;
  /** 최근 30일(KST 달력) 중 딜이 올라온 날 수. 같은 딜이 여러 곳에 올라와도 하루로 센다(서버). */
  activeDays: number;
  /** 많이 올라온 곳 최대 2곳(몫 15%+), share 는 %. */
  topSources: readonly { name: string; share: number }[];
};

/** 서버 통계 창과 같은 값. 「최근 N일 M건」도 이 창이다. */
export const KEYWORD_HUB_WINDOW_DAYS = 30;
/** 이보다 적으면 web 이 noindex — 얇은 허브. 추천 검색어도 이 이상만 고른다. */
export const KEYWORD_HUB_MIN_DEALS = 5;

/** 서버 normalizeHubText 와 같다 — 소문자·공백 없음. */
export const normalizeHubText = (s: string) => s.toLowerCase().replace(/\s+/g, '');

/**
 * 이 글자(검색어·내 키워드)가 허브 키워드 **자체**인가("삼다수", "플스 5"). 서버 isKeywordHubQuery 와 같은 규칙 —
 * 포함이 아니라 같음. "삼다수 2L" 는 허브가 아니라 검색 결과가 더 맞다.
 */
export function findKeywordHubForQuery<T extends KeywordHubTerms>(
  query: string | null | undefined,
  hubs: readonly T[],
): T | undefined {
  const q = normalizeHubText(query ?? '');
  if (!q) return undefined;
  return hubs.find((h) =>
    [h.slug, h.name, ...(h.aliases ?? [])].some((term) => normalizeHubText(term) === q),
  );
}

/** 제목 매칭용 — 별칭에 더해 제외어(콜라→콜라겐)까지. */
export type KeywordHubMatchTerms = KeywordHubTerms & { excludes?: readonly string[] | null };

/** 「(… 증정)」 「[사은품 …]」 같은 사은품 괄호 — 본품이 아니라 따라오는 것. */
const GIFT_PAREN = /[([][^)\]]*(?:증정|사은품)[^)\]]*[)\]]/g;

/**
 * 제목의 본품 부분(소문자 원문) — 사은품 괄호를 지우고 첫 구분 «+» 앞까지. «+» 가 구분이 아닌 것: 숫자+숫자(1+1·5+4박스),
 * 영숫자에 붙고 뒤가 비거나 공백·닫는 괄호인 모델 이름(갤럭시탭 S10 FE+).
 */
function hubMainPart(title: string): string {
  const raw = title.toLowerCase().replace(/＋/g, '+').replace(GIFT_PAREN, ' ');
  for (let i = 0; i < raw.length; i += 1) {
    if (raw[i] !== '+') continue;
    const prev = raw[i - 1] ?? '';
    const next = raw[i + 1] ?? '';
    if (/\d/.test(prev) && /\d/.test(next)) continue;
    if (/[a-z0-9]/.test(prev) && (next === '' || /[\s)\]]/.test(next))) continue;
    return raw.slice(0, i);
  }
  return raw;
}

/**
 * 허브 제외어에 걸리나 — 서버 hubExcludeHit 와 같은 규칙. 본품 부분이 허브 이름·별칭을 부르면 제외어도 본품 부분에서만 찾는다
 * («캡슐커피 + 머그 증정»의 머그, «청소기 + 충전거치대»의 거치대는 본품 딜을 지우지 않는다). 한 낱말 이름은 띄어쓰기째,
 * 여러 낱말 이름은 공백 무시. «+» 로 시작하는 제외어(«+콜라»)는 제목 전체에서 찾는다.
 */
function isExcludedByHub(title: string, hub: KeywordHubMatchTerms): boolean {
  if (!hub.excludes?.length) return false;
  const t = normalizeHubText(title);
  const mainRaw = hubMainPart(title);
  const main = normalizeHubText(mainRaw);
  const names = [hub.name, ...(hub.aliases ?? [])].map((x) => x.toLowerCase().trim()).filter(Boolean);
  const mainNamesHub =
    main !== t &&
    names.some((x) => (/\s/.test(x) ? main.includes(normalizeHubText(x)) : mainRaw.includes(x)));
  return hub.excludes.some((exclude) => {
    const key = normalizeHubText(exclude);
    if (!key) return false;
    return (mainNamesHub && !key.startsWith('+') ? main : t).includes(key);
  });
}

/**
 * 제목이 이 허브의 상품인가. 서버(crawling-server keyword-hub-match.ts)와 같은 규칙 — 상세에서 링크한 허브에
 * 그 딜이 안 보이면 이상하니, 바꾸면 양쪽을 같이 바꾼다.
 */
export function matchesKeywordHub(title: string, hub: KeywordHubMatchTerms): boolean {
  if (isExcludedByHub(title, hub)) return false;
  const t = normalizeHubText(title);
  return [hub.name, ...(hub.aliases ?? [])].some((term) => t.includes(normalizeHubText(term)));
}

/** 상세 → 허브 링크용. 제목에 걸리는 허브(최대 n개, 목록 순서 = 30일 딜 많은 순). */
export function findKeywordHubsForTitle<T extends KeywordHubMatchTerms>(
  title: string,
  hubs: readonly T[],
  max = 2,
): T[] {
  return hubs.filter((h) => matchesKeywordHub(title, h)).slice(0, max);
}

/**
 * 허브 → 그 키워드를 품은 관심사 묶음(테마). 테마 키워드 중 허브 키워드 **자체**가 있는 것(같음 비교 —
 * findKeywordHubForQuery 와 같은 규칙). 테마↔허브는 서버에 연결 테이블이 없어 이름으로 잇는다(2026-10-19 실측:
 * 공개 허브 80개 중 65개가 어느 테마에 들어 있다).
 */
export function findThemesForHub<T extends { keywords: readonly string[] }>(
  hub: KeywordHubTerms,
  themes: readonly T[],
  max = 2,
): T[] {
  return themes.filter((t) => t.keywords.some((k) => findKeywordHubForQuery(k, [hub]))).slice(0, max);
}

export function keywordHubPath(hub: Pick<KeywordHubTerms, 'slug'>): string {
  return `/keywords/${encodeURIComponent(hub.slug)}`;
}

/** 키워드 목록의 「최근 핫딜이 올라온 키워드」 창 — 마지막 딜이 사흘 안(/deals 의 「최근 핫딜」과 같은 창). */
export const KEYWORD_HUB_RECENT_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * 키워드 목록(web /keywords·앱 키워드 탭)을 「최근 핫딜이 올라온」/「기다리는」 둘로 나눈다. 서버 순서(30일 딜 많은 순)는 그대로.
 * activeDealCount(진행 중)는 쓰지 않는다 — 종료 표시가 안 찍힌 옛 딜이 많아 물티슈 30일 380건 중 344건이 「진행 중」으로 나왔다
 * (2026-10-17 운영). 게시 시각은 틀릴 일이 없다.
 */
export function splitKeywordHubsByRecency<T extends { lastDealAt?: string | null }>(
  hubs: readonly T[],
  now: number,
): { live: T[]; quiet: T[] } {
  const isRecent = (h: T) =>
    h.lastDealAt != null && now - Date.parse(h.lastDealAt) < KEYWORD_HUB_RECENT_WINDOW_MS;
  return { live: hubs.filter(isRecent), quiet: hubs.filter((h) => !isRecent(h)) };
}

/** 마지막 딜이 하루 안이면 강조(빨강) — 키워드 칸의 「3시간 전」 배지. */
export function isKeywordHubToday(lastDealAt: string, now: number): boolean {
  return now - Date.parse(lastDealAt) < DAY_MS;
}

/** "76건" / 수집 상한에 걸렸으면 "300건+". */
export function formatHubCount(hub: KeywordHubCount): string {
  return `${hub.recentDealCount.toLocaleString()}건${hub.countCapped ? '+' : ''}`;
}

/** 검색 요약 줄·앱 요약용 짧은 조각 — 「30일 중 29일 · 주로 뽐뿌 62%」. */
export function buildKeywordHubFacts(hub: Omit<KeywordHubRhythm, 'name'>): string[] {
  const facts: string[] = [];
  if (hub.activeDays > 0) facts.push(`${KEYWORD_HUB_WINDOW_DAYS}일 중 ${hub.activeDays}일`);
  const top = hub.topSources[0];
  if (top) facts.push(`주로 ${top.name} ${top.share}%`);
  return facts;
}

/**
 * 얼마나 자주·어디에 올라오나 — 「최근 30일 중 29일 올라왔어요」 + 빈도에 맞는 권유. 딜이 없으면 null.
 * 날짜·출처는 게시 시각·수집처라 틀릴 일이 없어 그대로 말해도 된다.
 */
export function describeKeywordHubRhythm(hub: KeywordHubRhythm) {
  if (hub.activeDays <= 0) return null;
  const windowDays = KEYWORD_HUB_WINDOW_DAYS;
  const often = hub.activeDays >= Math.round(windowDays * 0.7);
  return {
    headline: `최근 ${windowDays}일 중 ${hub.activeDays}일 올라왔어요`,
    advice: often
      ? `${hub.name} 핫딜은 거의 매일 올라와요. 급하지 않다면 알림을 걸어 두고 마음에 드는 딜을 골라도 돼요.`
      : `${hub.name} 핫딜은 매일 올라오지는 않아요. 알림을 걸어 두면 다음 딜을 놓치지 않아요.`,
    sources: hub.topSources.map((src) => `${src.name} ${src.share}%`).join(' · '),
  };
}

/**
 * 허브 머리의 한 줄 소개. web 허브 lead 의 앞 문장과 같다(web 은 SEO 설명용으로 「가장 최근 딜은 …」을 덧붙인다 —
 * 앱은 바로 아래 목록 첫 카드가 그 딜이라 붙이지 않는다). 토스·네이버쇼핑 같은 쇼핑몰 특가도 섞여 있어 "커뮤니티·쇼핑몰".
 */
export function buildKeywordHubLead(hub: Pick<KeywordHubRhythm, 'name'> & KeywordHubCount): string {
  return hub.recentDealCount > 0
    ? `최근 ${KEYWORD_HUB_WINDOW_DAYS}일 동안 커뮤니티·쇼핑몰 특가에 올라온 ${hub.name} 핫딜 ${formatHubCount(hub)}을 모았어요.`
    : `커뮤니티·쇼핑몰 특가에 올라오는 ${hub.name} 핫딜을 모아 보여드려요.`;
}
