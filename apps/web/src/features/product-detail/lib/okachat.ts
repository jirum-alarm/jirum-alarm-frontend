/** 핫딜 Only 오픈카톡방. 상세 soft 배너·구매 후 권유·홈 배너가 같은 방을 가리킨다. */
export const OKACHAT_LINK = 'https://open.kakao.com/o/gJZTWAAg';

/** 입장 클릭 후 soft/구매후 권유를 다시 안 띄우기 위한 플래그. */
export const OKACHAT_JOINED_KEY = 'jirum:okachat-joined';

export type OkachatPlacement = 'soft' | 'after_purchase';

export type PostPurchasePromptKind = 'kakao' | 'keyword';

/**
 * 오카방 봇이 심는 UTM (`utm_source=kakao` + campaign hotdeal_only|all_hotdeal|daily_*).
 * 이미 방에서 들어온 사람에게 "입장"을 또 권하면 노이즈다.
 */
export function isFromKakaoOpenChat(
  search = typeof window !== 'undefined' ? window.location.search : '',
): boolean {
  const params = new URLSearchParams(search);
  if (params.get('utm_source') === 'kakao') return true;
  const campaign = params.get('utm_campaign') ?? '';
  return campaign === 'hotdeal_only' || campaign === 'all_hotdeal' || campaign.startsWith('daily_');
}

export function hasJoinedOkachat(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.localStorage.getItem(OKACHAT_JOINED_KEY) === '1';
  } catch {
    return false;
  }
}

export function markOkachatJoined(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(OKACHAT_JOINED_KEY, '1');
  } catch {
    // private mode 등 — 권유만 반복될 수 있음, 클릭 자체는 동작
  }
}

export function shouldShowOkachatSoftPrompt(
  opts: { fromKakao?: boolean; joined?: boolean } = {},
): boolean {
  const fromKakao = opts.fromKakao ?? isFromKakaoOpenChat();
  const joined = opts.joined ?? hasJoinedOkachat();
  return !fromKakao && !joined;
}

/**
 * 구매 클릭 직후 보여줄 프롬프트 큐.
 * - 이미 오카방 유입/입장함 → 키워드만
 * - 비로그인 → 오카방 먼저(로그인 게이트 없음) → 키워드
 * - 로그인 → 키워드 먼저 → 오카방
 */
export function buildPostPurchasePromptQueue(
  isLoggedIn: boolean,
  opts: { fromKakao?: boolean; joined?: boolean } = {},
): PostPurchasePromptKind[] {
  const fromKakao = opts.fromKakao ?? isFromKakaoOpenChat();
  const joined = opts.joined ?? hasJoinedOkachat();
  if (fromKakao || joined) {
    return ['keyword'];
  }
  if (!isLoggedIn) {
    return ['kakao', 'keyword'];
  }
  return ['keyword', 'kakao'];
}

export function pushOkachatEvent(
  event: 'okachat_prompt_view' | 'okachat_prompt_click',
  placement: OkachatPlacement,
) {
  if (typeof window === 'undefined') return;
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    placement,
  });
}
