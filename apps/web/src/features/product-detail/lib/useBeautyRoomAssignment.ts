'use client';

import { env } from 'next-runtime-env';
import { useEffect, useState } from 'react';

import {
  BEAUTY_CATEGORY_ID,
  BEAUTY_ROOM_EXPERIMENT_ID,
  type BeautyRoomArm,
  beautyRoomArmForBucket,
  beautyRoomExpTag,
} from './beauty-room-experiment';
import { waitForDeviceId } from './first-visit-holdout';
import { answerHoldoutBucket } from './price-answer-holdout';

export type BeautyRoomAssignment = {
  arm: BeautyRoomArm;
  /** GA4 exp 파라미터 — `beauty_detail_room_v1:<a|b>` */
  exp: string;
  /** 뷰티방 링크(런타임 env). b 군 권유가 가리킨다. */
  beautyLink: string;
};

/** 뷰티방 링크 — /beauty 의 BeautyOkachatCta 와 같은 런타임 env. 비어 있으면 실험도 꺼진다. */
export const beautyRoomLink = () => env('NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL')?.trim() ?? '';

export function resolveBeautyRoom(
  deviceId: string | null,
  categoryId: number | null | undefined,
  link: string = beautyRoomLink(),
): BeautyRoomAssignment | null {
  if (!link) return null;
  const bucket = deviceId ? answerHoldoutBucket(deviceId, BEAUTY_ROOM_EXPERIMENT_ID) : null;
  const arm = beautyRoomArmForBucket(bucket, categoryId);
  return arm ? { arm, exp: beautyRoomExpTag(arm), beautyLink: link } : null;
}

/**
 * 이 상세의 뷰티방 실험 배정. null = 실험 대상 아님(화장품 아님·실험 꺼짐·기기 id 없음),
 * undefined = 화장품 상세에서 기기 id 를 기다리는 중 — 그동안 권유를 그리지 않는다(핫딜방을 띄웠다가
 * 뷰티방으로 바꾸면 b 군이 대조 화면을 잠깐 본다). 기기 id 는 보통 이미 있어 첫 effect 안에 정해진다.
 */
export function useBeautyRoomAssignment(
  categoryId: number | null | undefined,
): BeautyRoomAssignment | null | undefined {
  const target = categoryId === BEAUTY_CATEGORY_ID;
  const [assignment, setAssignment] = useState<BeautyRoomAssignment | null | undefined>(undefined);

  useEffect(() => {
    if (!target) return;
    let alive = true;
    void waitForDeviceId().then((deviceId) => {
      if (alive) setAssignment(resolveBeautyRoom(deviceId, categoryId));
    });
    return () => {
      alive = false;
    };
  }, [target, categoryId]);

  return target ? assignment : null;
}
