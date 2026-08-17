'use client';

import { useEffect } from 'react';

import { cn } from '@/shared/lib/cn';
import TalkLight from '@/shared/ui/common/icons/TalkLight';

import { markOkachatJoined, OKACHAT_LINK, pushOkachatEvent } from '../lib/okachat';

/**
 * 구매 링크 클릭 직후 뜨는 오카방 입장 권유.
 * PostPurchaseKeywordPrompt 와 같은 자리·어투 — 구매 CTA 위계는 유지한다.
 */
export default function PostPurchaseKakaoPrompt({
  show,
  onClose,
  className,
}: {
  show: boolean;
  onClose: () => void;
  className?: string;
}) {
  useEffect(() => {
    if (!show) return;
    pushOkachatEvent('okachat_prompt_view', 'after_purchase');
  }, [show]);

  if (!show) return null;

  const handleJoin = () => {
    markOkachatJoined();
    pushOkachatEvent('okachat_prompt_click', 'after_purchase');
    window.open(OKACHAT_LINK, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <div className={cn('bg-secondary-50 flex items-center gap-x-3 py-3', className)}>
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#FAE300]"
      >
        <TalkLight width={18} height={18} className="mt-0.5" />
      </span>
      <div className="min-w-0 flex-1">
        {/* "이런 핫딜"은 방금 본 상품을 가리키는 지시어인데 이 방은 카테고리 무관한
            전체 큐레이션 스트림이다 — 상품 특정은 옆 PostPurchaseKeywordPrompt 담당.
            2행은 soft 배너(KakaoOpenChatPrompt)와 같은 문구를 써서 두 카드가 방을
            같은 이름·같은 가치로 부르게 한다. */}
        <p className="text-sm font-semibold text-gray-800">카톡으로 핫딜 먼저 받아보세요</p>
        <p className="mt-0.5 truncate text-xs text-gray-500">
          지름알림이 엄선한 핫딜만 골라 보내드려요
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
          className="flex h-11 items-center px-1 text-xs text-gray-500"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
