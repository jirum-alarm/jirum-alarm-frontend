'use client';

import { useEffect, useState } from 'react';

import {
  buildPostPurchasePromptQueue,
  hasJoinedOkachat,
  type PostPurchasePromptKind,
} from '@/shared/lib/okachat';

import {
  clearPostPurchasePending,
  savePostPurchasePending,
  takePostPurchasePending,
} from './post-purchase-pending';

import type { BeautyRoomAssignment } from './useBeautyRoomAssignment';

/**
 * 구매 후 권유 큐(오카방·키워드) — 모바일 하단 바와 데스크톱 구매 버튼이 같이 쓴다.
 *
 * 구매 클릭 때 큐를 짜고, 쇼핑몰에서 돌아왔는데 이 페이지가 새로 그려졌으면(post-purchase-pending.ts)
 * 같은 큐를 한 번 다시 띄운다. 큐를 끝까지 넘기면 표식을 지운다.
 */
export function usePostPurchasePrompts({
  productId,
  isUserLogin,
  beautyRoom,
}: {
  productId: number;
  isUserLogin: boolean;
  /** useBeautyRoomAssignment 결과 — undefined 면 아직 배정 중(화장품 상세). */
  beautyRoom: BeautyRoomAssignment | null | undefined;
}) {
  const [queue, setQueue] = useState<PostPurchasePromptKind[]>([]);
  const room = beautyRoom?.arm === 'b' ? 'beauty' : 'hotdeal';

  // 돌아와서 새로 그려진 경우. 화장품 상세는 방 배정이 끝난 뒤에 — 입장 기록을 맞는 방으로 봐야 한다.
  const assigned = beautyRoom !== undefined;
  useEffect(() => {
    if (!assigned || !takePostPurchasePending(sessionStorage, productId, Date.now())) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sessionStorage 는 브라우저에만 있다. 서버 HTML(권유 없음)과 맞추려 하이드레이션 뒤에 꺼낸다.
    setQueue(buildPostPurchasePromptQueue(isUserLogin, { joined: hasJoinedOkachat(room) }));
  }, [assigned, productId, isUserLogin, room]);

  const start = () => {
    const next = buildPostPurchasePromptQueue(isUserLogin, { joined: hasJoinedOkachat(room) });
    if (next.length > 0) savePostPurchasePending(sessionStorage, productId, Date.now());
    setQueue(next);
  };

  const advance = () => {
    if (queue.length <= 1) clearPostPurchasePending(sessionStorage);
    setQueue((q) => q.slice(1));
  };

  return { phase: queue[0] ?? null, start, advance };
}
