'use client';

import { useEffect, useState } from 'react';

import {
  hasJoinedOkachat,
  markOkachatJoined,
  OKACHAT_LINK,
  okachatJoinedEvent,
  type OkachatRoom,
  openOkachatDirect,
  pushOkachatEvent,
  shouldShowOkachatSoftPrompt,
} from '@/shared/lib/okachat';

import { useBeautyRoomAssignment } from '../lib/useBeautyRoomAssignment';

import BeautyVerticalLink from './BeautyVerticalLink';
import KakaoOpenChatPrompt from './KakaoOpenChatPrompt';

/**
 * 상세 상단 soft 오카방 안내.
 * 오카방 UTM 유입·이미 입장한 유저에는 숨긴다(가입 유도가 아니라 되돌아가기가 됨).
 *
 * 화장품 상세는 실험 beauty_detail_room_v1: b 군은 같은 자리에서 뷰티방을 권하고(뷰티방 입장 기록이 있으면 숨김)
 * 아래에 「지름알림 뷰티에서 더 보기」 링크를 단다. 두 군 모두 이벤트에 exp 를 싣는다.
 */
export default function SoftKakaoOpenChatPrompt({
  className,
  categoryId,
  productId,
}: {
  className?: string;
  categoryId?: number | null;
  productId?: number;
}) {
  const assignment = useBeautyRoomAssignment(categoryId);
  const beauty = assignment?.arm === 'b';
  const room: OkachatRoom = beauty ? 'beauty' : 'hotdeal';
  const exp = assignment?.exp;
  // SSR/첫 페인트에선 숨김 → hydration 후 조건 통과 시에만 노출(utm·localStorage는 클라 전용).
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 화장품 상세는 군이 정해질 때까지 기다린다 — 핫딜방을 띄웠다가 뷰티방으로 바꾸지 않게.
    if (assignment === undefined) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- utm·localStorage 는 브라우저에만 있다. 서버 HTML(숨김)과 맞추려 하이드레이션 뒤에 판정한다.
    setVisible(shouldShowOkachatSoftPrompt({ joined: hasJoinedOkachat(room) }));
    // 같은 화면의 다른 권유(첫 방문 시트·구매 후)로 같은 방에 입장하면 이 카드도 숨긴다.
    // 다음 틱에 — 링크 클릭 도중에 a 를 지우면 이동이 씹힐 수 있다.
    const hide = () => setTimeout(() => setVisible(false), 0);
    const joinedEvent = okachatJoinedEvent(room);
    window.addEventListener(joinedEvent, hide);
    return () => window.removeEventListener(joinedEvent, hide);
  }, [assignment, room]);

  useEffect(() => {
    if (!visible) return;
    pushOkachatEvent('okachat_prompt_view', 'soft', room, exp);
  }, [visible, room, exp]);

  if (beauty && assignment) {
    return (
      <div className={className}>
        {visible && (
          <KakaoOpenChatPrompt
            href={assignment.beautyLink}
            title="뷰티 핫딜만 받는 카톡방"
            description="화장품·스킨케어 핫딜만 모아 보내드려요"
            onNavigate={(e) => {
              markOkachatJoined('beauty');
              pushOkachatEvent('okachat_prompt_click', 'soft', 'beauty', exp);
              if (openOkachatDirect('soft', { room: 'beauty', link: assignment.beautyLink, exp })) {
                e.preventDefault();
              }
            }}
          />
        )}
        <BeautyVerticalLink
          exp={assignment.exp}
          productId={productId}
          className={visible ? 'mt-2' : undefined}
        />
      </div>
    );
  }

  if (!visible) return null;

  return (
    <KakaoOpenChatPrompt
      href={OKACHAT_LINK}
      className={className}
      onNavigate={(e) => {
        markOkachatJoined();
        pushOkachatEvent('okachat_prompt_click', 'soft', 'hotdeal', exp);
        if (openOkachatDirect('soft', { exp })) e.preventDefault();
      }}
    />
  );
}
