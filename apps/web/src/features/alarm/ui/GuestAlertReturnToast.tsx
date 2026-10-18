'use client';

import { useQuery } from '@tanstack/react-query';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { PAGE } from '@/shared/config/page';
import { useDevice } from '@/shared/hooks/useDevice';
import useMyRouter from '@/shared/hooks/useMyRouter';
import { getUnreadCountAfterLastRead } from '@/shared/lib/alarmReadState';
import { useToast } from '@/shared/ui/common/Toast';

import { NotificationQueries } from '@/entities/notification';

const SHOWN_AT_KEY = 'jirum:guest-return-toast-at';
/** 같은 사람에게 반나절에 한 번 — 페이지마다 뜨면 소음이다. */
const COOLDOWN_MS = 12 * 60 * 60 * 1000;
/** 첫 화면이 그려진 뒤에 — 첫 페인트·첫 방문 시트와 겹치지 않게. */
const SHOW_DELAY_MS = 2500;

function shownRecently(): boolean {
  try {
    return Date.now() - Number(localStorage.getItem(SHOWN_AT_KEY) ?? '0') < COOLDOWN_MS;
  } catch {
    return true; // 저장소를 못 쓰면 매번 뜰 수 있으니 아예 안 띄운다
  }
}

function markShown() {
  try {
    localStorage.setItem(SHOWN_AT_KEY, String(Date.now()));
  } catch {
    // 시크릿 모드 등
  }
}

/** 기존 GTM 태그가 있는 keyword_prompt_view/click 을 쓴다(placement=guest_return) — 새 이벤트명은 태그 없이는 GA4 에 안 간다. */
function pushEvent(event: 'keyword_prompt_view' | 'keyword_prompt_click', count: number) {
  (window as unknown as { dataLayer?: Record<string, unknown>[] }).dataLayer?.push({
    event,
    placement: 'guest_return',
    count,
  });
}

/**
 * 게스트가 다시 왔을 때 «키워드 알림 N건이 와 있어요» — 알림함으로 잇는다.
 *
 * 왜(2026-10-19): 첫 방문 시트로 키워드를 건 게스트의 ~60% 는 푸시 토큰이 없어(권한 거절·조용한 요청·iOS 사파리) 알림이
 * 알림함에만 쌓인다. 그런데 다시 와도 검색으로 상세에 떨어지면 종(홈 헤더·하단 탭)이 없어서 알림이 왔는지 모른다.
 * 알림함을 마지막으로 본 뒤 새로 쌓인 게 있을 때만, 반나절에 한 번, 알림함 밖에서.
 */
export default function GuestAlertReturnToast() {
  const pathname = usePathname();
  const { device } = useDevice();
  const router = useMyRouter();
  const { toast } = useToast();
  const onAlarmPage = pathname.startsWith(PAGE.ALARM);
  const eligible = !device.isJirumAlarmApp && !onAlarmPage && !shownRecently();
  const { data: unreadCount } = useQuery({
    ...NotificationQueries.unreadCount(),
    enabled: eligible,
  });
  const scheduled = useRef(false);

  useEffect(() => {
    if (scheduled.current || !eligible || !unreadCount) return;
    const seenCount = getUnreadCountAfterLastRead(); // 알림함을 본 적 없으면 -1
    const fresh = seenCount < 0 ? unreadCount : unreadCount - seenCount;
    if (fresh <= 0) return;
    scheduled.current = true;
    const timer = setTimeout(() => {
      markShown();
      pushEvent('keyword_prompt_view', fresh);
      toast.success(`키워드 알림 ${fresh}건이 와 있어요`, {
        action: {
          label: '보기',
          onClick: () => {
            pushEvent('keyword_prompt_click', fresh);
            router.push(PAGE.ALARM);
          },
        },
      });
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, [eligible, unreadCount, router, toast]);

  return null;
}
