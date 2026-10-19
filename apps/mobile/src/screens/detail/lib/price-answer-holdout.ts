import {useEffect, useState} from 'react';

import {getDeviceId} from '@/shared/lib/device/device-id';
import {experimentBucket} from '@/shared/lib/experiment/experiment-bucket';

import {
  isPriceAnswerHoldoutBucket,
  PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID,
} from '@jirum/domain/price-answer-holdout';

/**
 * 「답」 숨김 실험 `price_answer_holdout_v1`(2026-10-14). 배정 규칙(id·비율·버킷)은 @jirum/domain price-answer-holdout —
 * web 과 같은 원본. 숨김 군 기기는 근거 블록의 가격 답(HISTORY·MARKET)을 안 보고, 노출 기록만 `evidence_holdout:<kind>` 로 남긴다.
 */
export {
  isPriceAnswerKind,
  PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID,
  PRICE_ANSWER_HOLDOUT_PERCENT,
} from '@jirum/domain/price-answer-holdout';

export function isPriceAnswerHoldout(
  deviceId: string | null | undefined,
  percent?: number,
): boolean {
  const bucket = deviceId
    ? experimentBucket(deviceId, PRICE_ANSWER_HOLDOUT_EXPERIMENT_ID)
    : null;
  return isPriceAnswerHoldoutBucket(bucket, percent);
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
