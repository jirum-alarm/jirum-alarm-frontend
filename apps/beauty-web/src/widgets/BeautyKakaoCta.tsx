'use client';

import { useEffect, useState } from 'react';

import { OKACHAT_PLACEMENT } from '@/shared/config/beauty';
import { cn } from '@/shared/lib/cn';
import {
  hasJoinedBeautyRoom,
  markBeautyRoomJoined,
  openOkachatDirect,
  pushOkachatEvent,
} from '@/shared/lib/okachat';
import { TalkLightIcon } from '@/shared/ui/icons';

/**
 * 뷰티 카톡방 입장 안내. 방 링크는 서버가 런타임 env `NEXT_PUBLIC_KAKAO_BEAUTY_ROOM_URL` 에서 읽어 넘긴다 —
 * 비어 있으면 아무것도 안 그린다(gitops configmap 에 값만 넣고 재시작하면 켜진다, 빌드 불필요).
 * 모양은 web features/product-detail/ui/KakaoOpenChatPrompt(연한 파란 면 + 카톡 마크 + 「입장」), 동작·계측은
 * web /beauty BeautyOkachatCta 와 같고 placement 만 beauty_home.
 */
export default function BeautyKakaoCta({ href, className }: { href: string; className?: string }) {
  // 입장 기록(localStorage)은 브라우저에만 있다 — 서버 HTML 은 숨김, 하이드레이션 뒤 판정.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage 는 브라우저에만 있다. 서버 HTML(숨김)과 맞추려 하이드레이션 뒤에 판정한다.
    setVisible(href !== '' && !hasJoinedBeautyRoom());
  }, [href]);

  useEffect(() => {
    if (visible) pushOkachatEvent('okachat_prompt_view', OKACHAT_PLACEMENT);
  }, [visible]);

  if (!visible) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        markBeautyRoomJoined();
        pushOkachatEvent('okachat_prompt_click', OKACHAT_PLACEMENT);
        if (openOkachatDirect(OKACHAT_PLACEMENT, href)) e.preventDefault();
      }}
      className={cn(
        'border-secondary-200 bg-secondary-50 hover:bg-secondary-100 flex items-center gap-x-3 rounded-lg border px-4 py-3 transition-colors',
        className,
      )}
    >
      <span
        aria-hidden
        className="bg-kakao flex size-7 shrink-0 items-center justify-center rounded-full"
      >
        <TalkLightIcon className="mt-0.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-gray-800">뷰티 핫딜만 받는 카톡방</span>
        <span className="mt-0.5 block truncate text-xs text-gray-500">
          화장품·스킨케어 핫딜만 모아 보내드려요
        </span>
      </span>
      <span
        aria-hidden
        className="border-secondary-300 text-secondary-600 shrink-0 rounded-full border bg-white px-3 py-1.5 text-xs font-semibold"
      >
        입장
      </span>
    </a>
  );
}
