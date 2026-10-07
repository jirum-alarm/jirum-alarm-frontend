import {matchMyKeyword} from '@/features/keyword-prompt/model/myKeywords';

/**
 * 알림 한 줄이 **어디서 왔나** — 그 알림을 끄거나 고치는 화면으로 잇는 데 쓴다.
 * 알림의 keyword 칸 모양으로 가른다(2026-10-07 운영 실측, crawling-server 가 이렇게 싣는다):
 * - 키워드: "햇반" · 가격 하락 "햇반 평소보다 54% 싸게 떴어요 📉" → 키워드 설정
 * - 관심사: "🥤 [생수·음료 쟁이기] 펩시 핫딜"(notification-theme.service) → 그 관심사 화면(구독 해제·딜)
 * - 좋은 딜: "🔥 지금 뜨는 좋은 딜"(good-deal-push-batch, 설정 hotDealAlert) → 알림 설정
 * web `features/alarm/lib/notificationSource.ts` 와 같은 규칙.
 *
 * 키(문자열)로 돌려준다 — 행 memo 가 객체 props 로 깨지지 않게. 해석은 `parseSourceKey`.
 */
export function notificationSourceKey(
  field: string | null | undefined,
  mine: Set<string>,
  themes: {id: string | number; name: string}[],
): string | undefined {
  if (!field) return undefined;
  const keyword = matchMyKeyword(field, mine);
  if (keyword) return `keyword:${keyword}`;
  const themeName = field.match(/\[(.+?)\]/)?.[1];
  if (themeName) {
    const theme = themes.find(t => t.name === themeName);
    // 이름이 바뀌었거나 내려간 관심사면 갈 데가 없다 — 라벨을 안 단다.
    return theme ? `theme:${theme.id}:${themeName}` : undefined;
  }
  if (field.includes('지금 뜨는 좋은 딜')) return 'goodDeal';
  return undefined;
}

export type NotificationSource =
  | {kind: 'keyword'; keyword: string}
  | {kind: 'theme'; themeId: string; name: string}
  | {kind: 'goodDeal'};

export function parseSourceKey(key: string): NotificationSource {
  if (key.startsWith('keyword:')) {
    return {kind: 'keyword', keyword: key.slice('keyword:'.length)};
  }
  if (key.startsWith('theme:')) {
    const [, themeId, ...name] = key.split(':');
    return {kind: 'theme', themeId, name: name.join(':')};
  }
  return {kind: 'goodDeal'};
}

/** 줄 위에 보일 라벨(뒤에 "›" 를 붙여 쓴다). */
export function sourceLabel(source: NotificationSource): string {
  if (source.kind === 'keyword') return `${source.keyword} 키워드 알림`;
  if (source.kind === 'theme') return `${source.name} 관심사 알림`;
  return '지금 뜨는 좋은 딜 알림';
}
