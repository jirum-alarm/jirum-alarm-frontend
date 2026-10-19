import type { GoodPriceUnit } from '@/shared/api/keyword/good-price.service';

/** 서버는 키워드를 소문자로 저장한다 — 비교도 소문자·앞뒤 공백 없이. */
export const normalizeKeyword = (keyword: string) => keyword.trim().toLowerCase();

/**
 * 알림의 keyword 칸에서 그걸 보낸 **내 키워드**(정규화)를 찾는다. 없으면 undefined.
 * 칸은 키워드 그대로("햇반")이거나 가격 하락 문구("햇반 최근 딜보다 싸게 떴어요 📉")이고,
 * 관심사 알림은 묶음 제목("🥤 [생수·음료 쟁이기] 펩시 핫딜")이라 안 맞는다(2026-10-07 운영 실측).
 * 키워드에 공백이 있을 수 있어("에어팟 프로") 첫 낱말이 아니라 "내 키워드 + 공백" 접두로 보고, 가장 긴 것을 고른다.
 * 앱 `features/keyword-prompt/model/myKeywords.ts` matchMyKeyword 와 같은 규칙.
 */
export function matchMyKeyword(
  notificationKeyword: string | null | undefined,
  mine: Set<string>,
): string | undefined {
  const k = normalizeKeyword(notificationKeyword ?? '');
  let best: string | undefined;
  for (const m of mine) {
    if ((k === m || k.startsWith(`${m} `)) && m.length > (best?.length ?? 0)) {
      best = m;
    }
  }
  return best;
}

/**
 * 알림 한 줄이 **어디서 왔나** — 그 알림을 끄거나 고치는 화면으로 잇는 링크.
 * 알림의 keyword 칸 모양으로 가른다(2026-10-07 운영 실측, crawling-server 가 이렇게 싣는다):
 * - 키워드: "햇반" · 가격 하락 "햇반 최근 딜보다 싸게 떴어요 📉" → 키워드 설정(펼친 채로)
 * - 관심사: "🥤 [생수·음료 쟁이기] 펩시 핫딜"(notification-theme.service) → 그 관심사 화면(구독 해제·딜)
 * - 좋은 딜: "(광고) 🔥 지금 뜨는 좋은 딜"(good-deal-push-batch, 설정 marketing) → 알림 설정
 * 앱 `screens/alarm/lib/notification-source.ts` 와 같은 규칙. 지운 키워드·없어진 관심사는 undefined.
 */
export function notificationSource(
  field: string | null | undefined,
  mine: Set<string>,
  themes: { id: string | number; name: string }[],
): { label: string; href: string; kind: 'keyword' | 'theme' | 'good_deal' } | undefined {
  if (!field) return undefined;
  const keyword = matchMyKeyword(field, mine);
  if (keyword) {
    return {
      kind: 'keyword',
      label: `${keyword} 키워드 알림`,
      href: `/mypage/keyword?focus=${encodeURIComponent(keyword)}`,
    };
  }
  const themeName = field.match(/\[(.+?)\]/)?.[1];
  if (themeName) {
    const theme = themes.find((t) => t.name === themeName);
    return theme
      ? { kind: 'theme', label: `${themeName} 관심사 알림`, href: `/themes/${theme.id}` }
      : undefined;
  }
  if (field.includes('지금 뜨는 좋은 딜')) {
    return { kind: 'good_deal', label: '지금 뜨는 좋은 딜 알림', href: '/mypage/notification' };
  }
  return undefined;
}

/** 이 건수 넘게 하루에 키워드 알림을 받은 사람에게 알림함 위에서 「핫딜이 되면만 받기」를 권한다. */
export const HEAVY_KEYWORD_ALERTS_PER_DAY = 5;

/**
 * 최근 24시간 동안 받은 **키워드 알림** 건수(관심사·좋은 딜·커뮤니티는 빼고).
 * 「핫딜만 받기」는 설정 화면에만 두면 아무도 안 켠다 — 키워드 조건(가격·제외 단어)이 그랬다(10/12 0/1,731, 그 화면 2주 방문 수십 명).
 * 그래서 알림이 많은 사람이 실제로 보는 자리(알림함)에서 권한다. 2026-10-07~13 사람·하루 평균 4.3건, 5건 넘는 날이 26%.
 * 앱 `screens/alarm/lib/notification-source.ts` recentKeywordAlertCount 와 같은 규칙.
 */
export function recentKeywordAlertCount(
  notifications: { keyword?: string | null; createdAt: string | number | Date }[],
  mine: Set<string>,
  now: number = Date.now(),
): number {
  const since = now - 24 * 3600_000;
  return notifications.filter(
    (n) => new Date(n.createdAt).getTime() >= since && matchMyKeyword(n.keyword, mine),
  ).length;
}

/** 한 키워드로 하루 이만큼 받으면 그 키워드에 「좋은 가격만 받기」를 권한다(서버가 좋은 가격을 말할 수 있을 때만). */
export const GOOD_PRICE_NUDGE_MIN_ALERTS = 2;

/**
 * 최근 24시간 동안 가장 많이 온 **내 키워드**와 건수. 동률이면 먼저 받은 순서.
 * 「핫딜만 받기」(전체 설정)보다 좁은 처방 — 시끄러운 키워드 하나만 좋은 가격일 때로 줄인다(2026-10-15:
 * 지난 7일 한 키워드로 7건+ 받은 58명 대부분이 펩시·삼다수 같은 생필품, 읽음 3.4%).
 * 앱 `screens/alarm/lib/notification-source.ts` topKeywordToday 와 같은 규칙.
 */
export function topKeywordToday(
  notifications: { keyword?: string | null; createdAt: string | number | Date }[],
  mine: Set<string>,
  now: number = Date.now(),
): { keyword: string; count: number } | undefined {
  const since = now - 24 * 3600_000;
  const counts = new Map<string, number>();
  for (const n of notifications) {
    if (new Date(n.createdAt).getTime() < since) continue;
    const k = matchMyKeyword(n.keyword, mine);
    if (k) counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  let top: { keyword: string; count: number } | undefined;
  for (const [keyword, count] of counts) if (!top || count > top.count) top = { keyword, count };
  return top;
}

export type { GoodPriceUnit };

/** 좋은 가격 한 줄: 「1L당 1,400원」·「액면가의 92%」·「289,000원」. ai 앱 features/wait/model/copy.ts unitPriceText 와 같은 문구. */
export function goodPriceText(unit: GoodPriceUnit, value: number): string {
  const won = `${Math.round(value).toLocaleString('ko-KR')}원`;
  if (unit === 'LITER') return `1L당 ${won}`;
  if (unit === 'HUNDRED_GRAM') return `100g당 ${won}`;
  if (unit === 'COUNT') return `1개당 ${won}`;
  if (unit === 'FACE_VALUE') return `액면가의 ${Math.round(value * 100)}%`;
  return won;
}
