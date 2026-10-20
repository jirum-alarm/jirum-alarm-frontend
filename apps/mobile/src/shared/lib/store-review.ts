import {requireOptionalNativeModule} from 'expo';

import {StorageKey} from '@/shared/constant/storage-key';
import {Analytics} from '@/shared/lib/analytics/ga4';
import {getAsyncStorage, setAsyncStorage} from '@/shared/lib/persistence';

/**
 * 스토어 평점 요청 — OS 기본 시트(iOS SKStoreReviewController·Play In-App Review)로만 묻는다.
 * iOS 심사 지침 5.6.1 은 앱이 만든 평점 팝업을 막는다. 내정보 「앱 평가하기」는 사람이 누르는 링크라 별개다.
 *
 * 왜: 웹→앱 넘기기가 사람들을 스토어로 보내는데 iOS 평점이 3.4(평가 12개)고, 리뷰 14건 중 7건이 옛 버그 제보다
 * (2026-10-21 실측). 잘 쓰는 사람에게 좋은 순간에 물어 평점을 지금 상태에 맞춘다.
 *
 * 네이티브 모듈(expo-store-review)은 1.5.7 바이너리부터 있다. 그 전 바이너리엔 없어 null 이라
 * 자동 요청은 조용히 아무것도 안 한다 — 옛 바이너리가 이 코드를 받아도 죽지 않는다(universal-link 와 같은 방식).
 */
type StoreReviewNativeModule = {
  isAvailableAsync(): Promise<boolean>;
  requestReview(): Promise<void>;
};

const native =
  requireOptionalNativeModule<StoreReviewNativeModule>('ExpoStoreReview');

/** 이만큼 다른 날에 앱을 썼어야 묻는다 — 한두 번 열어 본 사람에겐 안 묻는다. */
export const REVIEW_MIN_ACTIVE_DAYS = 5;
/** 이번 실행에서 딜을 이만큼 봤어야 — «방금 쓸모를 본» 순간에만. */
export const REVIEW_MIN_DEALS_THIS_SESSION = 2;
/** 한 번 물었으면 이만큼 쉰다(iOS 는 시스템이 1년 3번으로 또 자른다). */
export const REVIEW_COOLDOWN_MS = 120 * 24 * 60 * 60 * 1000;
const ACTIVE_DAYS_KEPT = 30;

/** KST 날짜 'YYYY-MM-DD'. */
export function kstDay(now: number): string {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** 앱을 쓴 날 목록에 오늘을 더한다 — 중복 없이, 최근 것만. */
export function addActiveDay(days: string[], today: string): string[] {
  if (days.includes(today)) return days;
  return [...days, today].slice(-ACTIVE_DAYS_KEPT);
}

export function shouldRequestReview(state: {
  activeDays: number;
  dealsThisSession: number;
  lastRequestedAt: number | null;
  now: number;
}): boolean {
  if (state.activeDays < REVIEW_MIN_ACTIVE_DAYS) return false;
  if (state.dealsThisSession < REVIEW_MIN_DEALS_THIS_SESSION) return false;
  return (
    state.lastRequestedAt == null ||
    state.now - state.lastRequestedAt >= REVIEW_COOLDOWN_MS
  );
}

let dealsThisSession = 0;

/** 상세 화면이 상품마다 한 번 부른다. */
export function noteDealViewed(): void {
  dealsThisSession += 1;
}

const readDays = async (): Promise<string[]> => {
  const stored: unknown = await getAsyncStorage(StorageKey.REVIEW_ACTIVE_DAYS);
  return Array.isArray(stored)
    ? stored.filter((d): d is string => typeof d === 'string')
    : [];
};

/** 앱이 앞으로 올 때마다. 하루 한 번만 실제로 쓴다. */
export async function recordActiveDay(now = Date.now()): Promise<void> {
  const days = await readDays();
  const next = addActiveDay(days, kstDay(now));
  if (next !== days) await setAsyncStorage(StorageKey.REVIEW_ACTIVE_DAYS, next);
}

/** 조건이 맞으면 OS 평점 시트를 띄운다. 띄웠으면 true(시스템이 실제로 보였는지는 알 수 없다). */
export async function maybeRequestReview(now = Date.now()): Promise<boolean> {
  if (!native) return false;
  const [days, last] = await Promise.all([
    readDays(),
    getAsyncStorage(StorageKey.REVIEW_REQUESTED_AT) as Promise<unknown>,
  ]);
  const lastRequestedAt = typeof last === 'number' ? last : null;
  if (
    !shouldRequestReview({
      activeDays: days.length,
      dealsThisSession,
      lastRequestedAt,
      now,
    })
  ) {
    return false;
  }
  if (!(await native.isAvailableAsync())) return false;
  // 먼저 적는다 — 시트를 띄우다 앱이 죽어도 다음 실행에 또 묻지 않게.
  await setAsyncStorage(StorageKey.REVIEW_REQUESTED_AT, now);
  Analytics.track('store_review_request', {active_days: days.length});
  await native.requestReview();
  return true;
}

/** 테스트용 — 실행 단위 카운터를 비운다. */
export function __resetStoreReviewForTest(): void {
  dealsThisSession = 0;
}
