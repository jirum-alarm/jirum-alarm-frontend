'use client';

import { useEffect, useState } from 'react';

import {
  markOkachatJoined,
  OKACHAT_LINK,
  pushOkachatEvent,
  shouldShowOkachatSoftPrompt,
} from '../lib/okachat';

import KakaoOpenChatPrompt from './KakaoOpenChatPrompt';

/**
 * 상세 상단 soft 오카방 안내.
 * 오카방 UTM 유입·이미 입장한 유저에는 숨긴다(가입 유도가 아니라 되돌아가기가 됨).
 */
export default function SoftKakaoOpenChatPrompt({ className }: { className?: string }) {
  // SSR/첫 페인트에선 숨김 → hydration 후 조건 통과 시에만 노출(utm·localStorage는 클라 전용).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowOkachatSoftPrompt());
  }, []);

  useEffect(() => {
    if (!visible) return;
    pushOkachatEvent('okachat_prompt_view', 'soft');
  }, [visible]);

  if (!visible) return null;

  return (
    <KakaoOpenChatPrompt
      href={OKACHAT_LINK}
      className={className}
      onNavigate={() => {
        markOkachatJoined();
        pushOkachatEvent('okachat_prompt_click', 'soft');
      }}
    />
  );
}
