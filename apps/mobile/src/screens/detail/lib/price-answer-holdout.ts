import {useEffect, useState} from 'react';

import {getDeviceId} from '@/shared/lib/device/device-id';
import {experimentBucket} from '@/shared/lib/experiment/experiment-bucket';

/**
 * 「답」 숨김 실험 `price_answer_holdout_v1`(2026-10-14, crawling-server experiment-registry) — web
 * `features/product-detail/lib/price-answer-holdout.ts` 와 같은 id·비율·해시(서버 experimentBucket 과 같은 값).
 * 숨김 군 기기는 근거 블록의 가격 답(HISTORY·MARKET)을 안 보고, 노출 기록만 `evidence_holdout:<kind>` 로 남긴다.
 * ★진행 중인 실험 id 를 바꾸면 배정이 섞인다. 끄려면 PERCENT 를 0 으로(OTA).
 */
export const PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID = 'price_answer_holdout_v1';
export const PRICE_ANSWER_HOLDOUT_PERCENT = 20;

export const isPriceAnswerKind = (kind: string | null | undefined) =>
  kind === 'HISTORY' || kind === 'MARKET';

export function isPriceAnswerHoldout(
  deviceId: string | null | undefined,
  percent: number = PRICE_ANSWER_HOLDOUT_PERCENT,
): boolean {
  if (!deviceId || percent <= 0) return false;
  return (
    experimentBucket(deviceId, PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID) < percent
  );
}

/**
 * 기기 id 를 읽기 전엔 null — 그동안 가격 답을 그리지 않는다(그렸다가 지우면 숨김 군이 답을 잠깐 본다).
 * 저장소 읽기라 첫 프레임 안팎이다. 읽기에 실패하면 대조(false).
 */
export function usePriceAnswerHoldout(): boolean | null {
  const [holdout, setHoldout] = useState<boolean | null>(null);
  useEffect(() => {
    let alive = true;
    getDeviceId()
      .then(id => alive && setHoldout(isPriceAnswerHoldout(id)))
      .catch(() => alive && setHoldout(false));
    return () => {
      alive = false;
    };
  }, []);
  return holdout;
}
