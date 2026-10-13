import { answerHoldoutBucket } from './price-answer-holdout';

/**
 * 첫 방문 시트 숨김 실험 `first_visit_sheet_holdout_v1`(2026-10-14, crawling-server experiment-registry).
 *
 * 질문: 상세 첫 방문 시트(알림 등록·카톡방·앱 설치)가 검색 유입의 첫 화면에서 구매 버튼을 가려 구매를 깎나,
 * 아니면 시트로 생긴 알림이 나중 구매로 메꾸나. 시트를 끌지(또는 구매 뒤로 미룰지) 정한다.
 *
 * 버킷은 서버 experimentBucket 과 같은 sha256(`${실험id}:${기기id}`) % 100 — price-answer-holdout 과 같은 함수,
 * 실험 id 가 달라 두 실험의 군은 서로 독립이다. 숨김 군은 SEEN 을 남기지 않는다(실험을 끄면 그때 시트를 본다).
 * 배정 기록: price_context_impression detail=`first_visit:holdout` | `first_visit:<시트 종류>`(대조).
 * ★진행 중에 실험 id 를 바꾸면 군이 섞인다. 끄려면 PERCENT 를 0 으로(웹 태그).
 */
export const FIRST_VISIT_HOLDOUT_EXPERIMENT_ID = 'first_visit_sheet_holdout_v1';
export const FIRST_VISIT_HOLDOUT_PERCENT = 30;
const DEVICE_ID_KEY = 'jirum-alarm-device-id';

export function isFirstVisitHoldout(deviceId: string): boolean {
  return (
    FIRST_VISIT_HOLDOUT_PERCENT > 0 &&
    answerHoldoutBucket(deviceId, FIRST_VISIT_HOLDOUT_EXPERIMENT_ID) < FIRST_VISIT_HOLDOUT_PERCENT
  );
}

/**
 * 기기 id 를 기다려 읽는다 — 첫 방문엔 상위 DeviceId 프로바이더가 effect 에서 만드는데, 자식(시트) effect 가 먼저 돈다.
 * 시간 안에 못 읽으면 null(호출부는 대조로 다룬다).
 */
export async function waitForDeviceId(timeoutMs = 2000, stepMs = 100): Promise<string | null> {
  for (let waited = 0; ; waited += stepMs) {
    try {
      const id = localStorage.getItem(DEVICE_ID_KEY);
      if (id) return id;
    } catch {
      return null;
    }
    if (waited >= timeoutMs) return null;
    await new Promise((resolve) => setTimeout(resolve, stepMs));
  }
}
