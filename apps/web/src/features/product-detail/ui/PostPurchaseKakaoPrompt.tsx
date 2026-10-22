'use client';

import { text } from '@jirum/design-system/recipes';
import { useEffect } from 'react';

import { cn } from '@/shared/lib/cn';
import {
  markOkachatJoined,
  OKACHAT_LINK,
  openOkachatDirect,
  pushOkachatEvent,
} from '@/shared/lib/okachat';
import { runWhenSeen } from '@/shared/lib/run-when-seen';
import TalkLight from '@/shared/ui/common/icons/TalkLight';

import type { BeautyRoomAssignment } from '../lib/useBeautyRoomAssignment';

/**
 * 구매 링크 클릭 직후 뜨는 오카방 입장 권유.
 * PostPurchaseKeywordPrompt 와 같은 자리·어투 — 구매 CTA 위계는 유지한다.
 * 화장품 상세 실험(beauty_detail_room_v1) b 군은 뷰티방을 권한다 — 큐는 호출부가 뷰티방 입장 기록으로 짠다.
 */
export default function PostPurchaseKakaoPrompt({
  show,
  onClose,
  className,
  beautyRoom,
}: {
  show: boolean;
  onClose: () => void;
  className?: string;
  /** useBeautyRoomAssignment 결과 — 화장품 상세가 아니면 null/undefined(핫딜방, exp 없음). */
  beautyRoom?: BeautyRoomAssignment | null;
}) {
  const beauty = beautyRoom?.arm === 'b';
  const room = beauty ? 'beauty' : 'hotdeal';
  const link = beauty ? beautyRoom.beautyLink : OKACHAT_LINK;
  const exp = beautyRoom?.exp;

  // 쇼핑몰 창이 앞으로 오면 이 카드는 아무도 못 본다 — 실제로 보일 때만 노출로 센다(run-when-seen.ts).
  useEffect(() => {
    if (!show) return;
    return runWhenSeen(() => pushOkachatEvent('okachat_prompt_view', 'after_purchase', room, exp));
  }, [show, room, exp]);

  if (!show) return null;

  const handleJoin = () => {
    markOkachatJoined(room);
    pushOkachatEvent('okachat_prompt_click', 'after_purchase', room, exp);
    if (!openOkachatDirect('after_purchase', { room, link, exp })) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
    onClose();
  };

  return (
    <div className={cn('bg-secondary-50 flex items-center gap-x-3 py-3', className)}>
      <span
        aria-hidden
        className="bg-kakao flex size-7 shrink-0 items-center justify-center rounded-full"
      >
        <TalkLight width={18} height={18} className="mt-0.5" />
      </span>
      <div className="min-w-0 flex-1">
        {/* "이런 핫딜"은 방금 본 상품을 가리키는 지시어인데 이 방은 카테고리 무관한
            전체 큐레이션 스트림이다 — 상품 특정은 옆 PostPurchaseKeywordPrompt 담당.
            2행은 soft 배너(KakaoOpenChatPrompt)와 같은 문구를 써서 두 카드가 방을
            같은 이름·같은 가치로 부르게 한다. */}
        <p className="text-sm font-semibold text-gray-800">
          {beauty ? '카톡으로 뷰티 핫딜 먼저 받아보세요' : '카톡으로 핫딜 먼저 받아보세요'}
        </p>
        <p className={cn(text.caption, 'mt-0.5 truncate')}>
          {beauty
            ? '화장품·스킨케어 핫딜만 모아 보내드려요'
            : '지름알림이 엄선한 핫딜만 골라 보내드려요'}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-x-2">
        <button
          type="button"
          onClick={handleJoin}
          className="text-secondary-600 flex h-11 items-center px-1 text-xs font-bold"
        >
          입장
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="카톡방 안내 닫기"
          className={cn(text.caption, 'flex h-11 items-center px-1')}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
