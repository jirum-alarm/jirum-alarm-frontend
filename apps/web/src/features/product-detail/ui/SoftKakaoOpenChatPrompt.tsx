'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';

import { OrderOptionType, ProductOrderType } from '@/shared/api/gql/graphql';

import { ProductQueries } from '@/entities/product';

import {
  markOkachatJoined,
  OKACHAT_LINK,
  pickLiveDeal,
  pushOkachatEvent,
  shouldShowOkachatSoftPrompt,
} from '../lib/okachat';

import KakaoOpenChatPrompt from './KakaoOpenChatPrompt';

/**
 * 상세 상단 soft 오카방 안내.
 * 오카방 UTM 유입·이미 입장한 유저에는 숨긴다(가입 유도가 아니라 되돌아가기가 됨).
 *
 * "엄선한 핫딜" 같은 방 스펙 문구로는 CTR 0.6~1.0% 에 머물렀다. 사람이 핫딜방에
 * 들어가는 동기는 편의가 아니라 싸게 사는 것이라, 방에 실제로 올라온 딜 가격을 보여준다.
 */
export default function SoftKakaoOpenChatPrompt({ className }: { className?: string }) {
  // SSR/첫 페인트에선 숨김 → hydration 후 조건 통과 시에만 노출(utm·localStorage는 클라 전용).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowOkachatSoftPrompt());
  }, []);

  const { data, isPending } = useQuery({
    ...ProductQueries.products({
      limit: 10,
      isHot: true,
      isEnd: false,
      orderBy: ProductOrderType.PostedAt,
      orderOption: OrderOptionType.Desc,
    }),
    enabled: visible,
    staleTime: 5 * 60 * 1000,
    // 실패하면 기존 문구로 바로 그린다 — 재시도 백오프 동안 카드가 안 뜨는 게 더 손해.
    retry: false,
  });

  // 딜이 도착한 뒤 한 번에 그린다. 문구가 기본값 → 딜로 바뀌면 두 줄이 다 깜빡인다.
  const shown = visible && !isPending;

  useEffect(() => {
    if (!shown) return;
    pushOkachatEvent('okachat_prompt_view', 'soft');
  }, [shown]);

  if (!shown) return null;

  return (
    <KakaoOpenChatPrompt
      href={OKACHAT_LINK}
      className={className}
      liveDeal={pickLiveDeal(data?.products ?? [])}
      onNavigate={() => {
        markOkachatJoined();
        pushOkachatEvent('okachat_prompt_click', 'soft');
      }}
    />
  );
}
