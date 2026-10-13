import {useEffect, useState} from 'react';

import {getDeviceId} from '@/shared/lib/device/device-id';
import {experimentBucket} from '@/shared/lib/experiment/experiment-bucket';

/**
 * 화장품 상세 → 뷰티 버티컬 실험 `beauty_detail_room_v1`(2026-10-14) — web
 * `features/product-detail/lib/beauty-room-experiment.ts` 와 같은 id·비율·해시(서버 experimentBucket 과 같은 값).
 *
 * 화장품(categoryId 3) 상세만, 기기 단위 50/50. 버킷 < PERCENT 면 b — 상세 카톡 권유(soft·구매 후)가 뷰티방을 권하고
 * 「지름알림 뷰티에서 더 보기」(/beauty 웹뷰)를 단다. a 는 지금 그대로 핫딜방. 두 군 모두 okachat 이벤트에 exp 를 싣는다.
 * ★진행 중인 실험 id 를 바꾸면 배정이 섞인다. 끄려면 PERCENT 를 0 으로(OTA).
 */
export const BEAUTY_ROOM_EXPERIMENT_ID = 'beauty_detail_room_v1';
export const BEAUTY_ROOM_PERCENT = 50;
export const BEAUTY_CATEGORY_ID = 3;

export type BeautyRoomArm = 'a' | 'b';

export type BeautyRoomAssignment = {
  arm: BeautyRoomArm;
  /** GA4 exp 파라미터 — `beauty_detail_room_v1:<a|b>` */
  exp: string;
};

/** 실험 대상이 아니면 null — 화장품이 아니거나, 기기 id 가 없거나, 실험이 꺼졌다. */
export function beautyRoomAssignment(
  deviceId: string | null | undefined,
  categoryId: number | null | undefined,
  percent: number = BEAUTY_ROOM_PERCENT,
): BeautyRoomAssignment | null {
  if (categoryId !== BEAUTY_CATEGORY_ID || !deviceId || percent <= 0) {
    return null;
  }
  const arm: BeautyRoomArm =
    experimentBucket(deviceId, BEAUTY_ROOM_EXPERIMENT_ID) < percent ? 'b' : 'a';
  return {arm, exp: `${BEAUTY_ROOM_EXPERIMENT_ID}:${arm}`};
}

/**
 * 이 상세의 배정. null = 대상 아님, undefined = 화장품 상세에서 기기 id 를 읽는 중 —
 * 그동안 권유를 그리지 않는다(핫딜방을 띄웠다가 뷰티방으로 바꾸면 b 군이 대조 화면을 잠깐 본다).
 */
export function useBeautyRoomAssignment(
  categoryId: number | null | undefined,
): BeautyRoomAssignment | null | undefined {
  const target = categoryId === BEAUTY_CATEGORY_ID;
  const [assignment, setAssignment] = useState<
    BeautyRoomAssignment | null | undefined
  >(undefined);

  useEffect(() => {
    if (!target) return;
    let alive = true;
    getDeviceId()
      .then(id => alive && setAssignment(beautyRoomAssignment(id, categoryId)))
      .catch(() => alive && setAssignment(null));
    return () => {
      alive = false;
    };
  }, [target, categoryId]);

  return target ? assignment : null;
}
