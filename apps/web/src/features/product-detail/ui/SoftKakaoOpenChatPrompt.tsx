'use client';

import { useEffect, useState } from 'react';

import {
  markOkachatJoined,
  OKACHAT_JOINED_EVENT,
  OKACHAT_LINK,
  openOkachatDirect,
  pushOkachatEvent,
  shouldShowOkachatSoftPrompt,
} from '@/shared/lib/okachat';

import KakaoOpenChatPrompt from './KakaoOpenChatPrompt';

/**
 * 상세 상단 soft 오카방 안내.
 * 오카방 UTM 유입·이미 입장한 유저에는 숨긴다(가입 유도가 아니라 되돌아가기가 됨).
 */
export default function SoftKakaoOpenChatPrompt({ className }: { className?: string }) {
  // SSR/첫 페인트에선 숨김 → hydration 후 조건 통과 시에만 노출(utm·localStorage는 클라 전용).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- utm·localStorage 는 브라우저에만 있다. 서버 HTML(숨김)과 맞추려 하이드레이션 뒤에 판정한다.
    setVisible(shouldShowOkachatSoftPrompt());
    // 같은 화면의 다른 권유(첫 방문 시트·구매 후)로 입장하면 이 카드도 숨긴다.
    // 다음 틱에 — 링크 클릭 도중에 a 를 지우면 이동이 씹힐 수 있다.
    const hide = () => setTimeout(() => setVisible(false), 0);
    window.addEventListener(OKACHAT_JOINED_EVENT, hide);
    return () => window.removeEventListener(OKACHAT_JOINED_EVENT, hide);
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
      onNavigate={(e) => {
        markOkachatJoined();
        pushOkachatEvent('okachat_prompt_click', 'soft');
        if (openOkachatDirect('soft')) e.preventDefault();
      }}
    />
  );
}
