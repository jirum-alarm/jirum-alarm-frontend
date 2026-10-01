import * as Haptics from 'expo-haptics';

/**
 * 켜고 끄는 손맛 — 좋아요·추천·구독·스위치처럼 **누르는 즉시 상태가 바뀌는** 토글에 쓴다.
 * 결과를 알려야 하는 등록·실패는 토스트(success/error)가 자기 진동을 낸다.
 */
export const tick = () => {
  Haptics.selectionAsync().catch(() => {});
};
