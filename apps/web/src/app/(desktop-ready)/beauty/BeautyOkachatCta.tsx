'use client';

import { env } from 'next-runtime-env';
import { useEffect, useState } from 'react';

import {
  hasJoinedOkachat,
  markOkachatJoined,
  openOkachatDirect,
  pushOkachatEvent,
} from '@/shared/lib/okachat';

import KakaoOpenChatPrompt from '@/features/product-detail/ui/KakaoOpenChatPrompt';

/**
 * /beauty 의 뷰티 핫딜 카톡방 입장 안내. 방 링크는 런타임 env `NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL`
 * (gitops frontend-web configmap — 카카오 JS 키와 같은 자리). 비어 있으면 아무것도 안 그린다 → 방을 만든 뒤
 * configmap 에 값만 넣고 재시작하면 켜진다(빌드 불필요).
 * 계측은 기존 오카방과 같은 이벤트에 placement=beauty_landing, room=beauty.
 */
export default function BeautyOkachatCta({ className }: { className?: string }) {
  const href = env('NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL')?.trim() ?? '';
  // 입장 기록(localStorage)은 브라우저에만 있다 — 서버 HTML 은 숨김, 하이드레이션 뒤 판정.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage 는 브라우저에만 있다. 서버 HTML(숨김)과 맞추려 하이드레이션 뒤에 판정한다.
    setVisible(href !== '' && !hasJoinedOkachat('beauty'));
  }, [href]);

  useEffect(() => {
    if (!visible) return;
    pushOkachatEvent('okachat_prompt_view', 'beauty_landing', 'beauty');
  }, [visible]);

  if (!visible) return null;

  return (
    <KakaoOpenChatPrompt
      href={href}
      className={className}
      title="뷰티 핫딜만 받는 카톡방"
      description="화장품·스킨케어 핫딜만 모아 보내드려요"
      onNavigate={(e) => {
        markOkachatJoined('beauty');
        pushOkachatEvent('okachat_prompt_click', 'beauty_landing', 'beauty');
        if (openOkachatDirect('beauty_landing', { room: 'beauty', link: href })) e.preventDefault();
      }}
    />
  );
}
