import {useEffect, useState} from 'react';
import {useQuery} from '@tanstack/react-query';

import {UserQueries} from '@/entities/user/user.queries';
import {getDeviceId} from '@/shared/lib/device/device-id';
import {experimentBucket} from '@/shared/lib/experiment/experiment-bucket';

/**
 * 구매 링크를 어디서 여나 — 실험 `app_purchase_webview_v1`(2026-10-13, crawling-server experiment-registry).
 *
 * - `in_app_browser`(대조): 지금까지처럼 시스템 인앱 브라우저. 쇼핑몰 앱이 있어도 웹 상품 페이지가 뜬다.
 * - `webview`(처치): 우리 구매 웹뷰(PurchaseBrowserScreen). 제휴 페이지가 부르는 앱 링크를 받아
 *   쿠팡·토스·오늘의집 앱으로 바로 넘긴다.
 *
 * 배정은 기기 id 해시(서버 experimentBucket 과 같은 값) — 분석은 user_history 의 deviceId 로 군을 다시 계산한다.
 * 기기 id 를 아직 못 읽었으면 대조로 연다(배정과 다른 경험을 한 클릭은 분석에서 소수라 무시).
 */
export const PURCHASE_WEBVIEW_EXPERIMENT_ID = 'app_purchase_webview_v1';
/**
 * 처치 비율. 2026-10-13 50 으로 시작 → 같은 날 100(전원 웹뷰, 사용자 결정 — 경험 개선을 반만 주지 않는다).
 * AB 는 중단, 효과는 앱 클릭당 주문의 전후 비교로 본다(등록부 app_purchase_webview_v1). 되돌리려면 0.
 */
export const PURCHASE_WEBVIEW_PERCENT = 100;
/** 운영자 계정은 늘 처치로 연다 — 분석은 이 계정 클릭을 뺀다(가격추이 holdout 과 같은 방식). */
export const PURCHASE_WEBVIEW_FORCED_USER_IDS: readonly number[] = [9];

export type PurchaseBrowserArm = 'webview' | 'in_app_browser';

export function purchaseBrowserArm(
  deviceId: string | null | undefined,
  /** me.id — GraphQL ID 라 문자열로 온다. */
  userId: string | number | null | undefined,
  percent: number = PURCHASE_WEBVIEW_PERCENT,
): PurchaseBrowserArm {
  if (
    userId != null &&
    PURCHASE_WEBVIEW_FORCED_USER_IDS.includes(Number(userId))
  ) {
    return 'webview';
  }
  // 전원 적용이면 기기 id 를 못 읽은 탭도 웹뷰로.
  if (percent >= 100) return 'webview';
  if (!deviceId || percent <= 0) return 'in_app_browser';
  return experimentBucket(deviceId, PURCHASE_WEBVIEW_EXPERIMENT_ID) < percent
    ? 'webview'
    : 'in_app_browser';
}

/** 상세 화면이 뜰 때 미리 정해 둔다 — 구매 탭에서 저장소를 기다리면 한 박자 늦다. */
export function usePurchaseBrowserArm(): PurchaseBrowserArm {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const {data: userId} = useQuery(UserQueries.me());
  useEffect(() => {
    let alive = true;
    getDeviceId()
      .then(id => alive && setDeviceId(id))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return purchaseBrowserArm(deviceId, userId);
}
