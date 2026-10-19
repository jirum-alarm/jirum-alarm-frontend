import {useEffect, useState} from 'react';

import {getDeviceId} from '@/shared/lib/device/device-id';
import {experimentBucket} from '@/shared/lib/experiment/experiment-bucket';

import {
  BEAUTY_CATEGORY_ID,
  BEAUTY_ROOM_EXPERIMENT_ID,
  type BeautyRoomArm,
  beautyRoomArmForBucket,
  beautyRoomExpTag,
} from '@jirum/domain/beauty-room-experiment';

/**
 * 화장품 상세 → 뷰티 버티컬 실험 `beauty_detail_room_v1`(2026-10-14). 배정 규칙(id·비율·카테고리·버킷→군)은
 * @jirum/domain beauty-room-experiment — web 과 같은 원본. 여기엔 기기 id 읽기(앱 저장소)만 둔다.
 * b 군은 상세 카톡 권유(soft·구매 후)가 뷰티방을 권하고 「지름알림 뷰티에서 더 보기」(/beauty 웹뷰)를 단다.
 */
export {
  BEAUTY_CATEGORY_ID,
  BEAUTY_ROOM_EXPERIMENT_ID,
  BEAUTY_ROOM_PERCENT,
  type BeautyRoomArm,
} from '@jirum/domain/beauty-room-experiment';

export type BeautyRoomAssignment = {
  arm: BeautyRoomArm;
  /** GA4 exp 파라미터 — `beauty_detail_room_v1:<a|b>` */
  exp: string;
};

/** 실험 대상이 아니면 null — 화장품이 아니거나, 기기 id 가 없거나, 실험이 꺼졌다. */
export function beautyRoomAssignment(
  deviceId: string | null | undefined,
  categoryId: number | null | undefined,
  percent?: number,
): BeautyRoomAssignment | null {
  const bucket = deviceId
    ? experimentBucket(deviceId, BEAUTY_ROOM_EXPERIMENT_ID)
    : null;
  const arm = beautyRoomArmForBucket(bucket, categoryId, percent);
  return arm ? {arm, exp: beautyRoomExpTag(arm)} : null;
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
