/**
 * 키워드 미리보기 문장 — 등록 화면·내 키워드 목록이 «이 키워드로 알림이 얼마나 오나»를 말한다(web·앱 같은 문장).
 * 숫자는 crawling-server `keywordDealFrequencies`(키워드 알림과 같은 매칭·같은 풀, 같은 날 같은 가격은 한 번).
 *
 * 왜(2026-10-19): 활성 키워드 1,402개 중 여러 낱말인데 90일 3번 미만이 265개, 키워드가 전부 3번 미만인 사람이 713명 중 233명.
 * 등록하는 순간엔 알 길이 없어 «알림이 안 오는 서비스»로 남았다. 3번 미만이면 서버가 첫 낱말(대개 브랜드)을 제안한다.
 */
export type KeywordFrequency = {
  keyword: string;
  dealCount: number;
  windowDays: number;
  /** ISO 문자열(GraphQL DateTime) 또는 Date */
  lastDealAt: string | Date | null;
  suggestedKeyword: string | null;
  suggestedDealCount: number | null;
};

/** 이보다 적으면 알림이 «드물다» — 서버 제안 기준(BROADEN_MIN_DEALS)과 같다. */
export const SPARSE_KEYWORD_DEALS = 3;

const DAY_MS = 24 * 60 * 60 * 1000;

/** KST 달력 날짜 차이 — 「오늘」·「어제」·「N일 전」. */
export function daysAgoText(at: string | Date, now: Date = new Date()): string {
  const kstDay = (d: Date) => Math.floor((d.getTime() + 9 * 60 * 60 * 1000) / DAY_MS);
  const diff = kstDay(now) - kstDay(new Date(at));
  if (diff <= 0) return '오늘';
  if (diff === 1) return '어제';
  return `${diff}일 전`;
}

/** 키워드 카드·입력칸 아래 한 줄. sparse 면 화면이 «넓혀 받기»를 같이 보여 준다. */
export function describeKeywordFrequency(
  f: Pick<KeywordFrequency, 'dealCount' | 'windowDays' | 'lastDealAt'>,
  now: Date = new Date(),
): { text: string; sparse: boolean } {
  const period = `최근 ${f.windowDays}일`;
  if (f.dealCount <= 0) return { text: `${period} 동안 올라온 적이 없어요`, sparse: true };
  const last = f.lastDealAt ? ` · 마지막 ${daysAgoText(f.lastDealAt, now)}` : '';
  if (f.dealCount < SPARSE_KEYWORD_DEALS) {
    return { text: `${period} ${f.dealCount}번뿐이에요${last}`, sparse: true };
  }
  return { text: `${period} ${f.dealCount}번 올라왔어요${last}`, sparse: false };
}

/**
 * 드문 키워드에 붙이는 제안 문장·버튼 — 제안이 없으면 null.
 * button = 이미 등록한 키워드 옆(「도 받기」, 원래 키워드는 그대로), registerButton = 등록 전 입력칸(대신 등록).
 */
export function broadenSuggestion(
  f: Pick<KeywordFrequency, 'dealCount' | 'suggestedKeyword' | 'suggestedDealCount'>,
): { keyword: string; text: string; button: string; registerButton: string } | null {
  if (f.dealCount >= SPARSE_KEYWORD_DEALS || !f.suggestedKeyword || f.suggestedDealCount == null) {
    return null;
  }
  return {
    keyword: f.suggestedKeyword,
    text: `‘${f.suggestedKeyword}’로 받으면 같은 기간 ${f.suggestedDealCount}번이에요`,
    button: `‘${f.suggestedKeyword}’도 받기`,
    registerButton: `‘${f.suggestedKeyword}’로 등록`,
  };
}
