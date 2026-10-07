'use client';

import { m } from 'motion/react';

import { PAGE } from '@/shared/config/page';
import { useHasNewAlarm } from '@/shared/hooks/useHasNewAlarm';
import { Alert } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

/**
 * 알림함 종 — 홈 헤더 우측(검색 옆). 새 알림이 있으면 하단 탭과 같은 빨간 점.
 * 하단 탭에도 알림이 있지만, 헤더 종이 "새 알림 왔나" 를 보는 익숙한 자리다(사용자 요청 2026-10-07).
 * 모양·터치 영역은 SearchLinkButton 과 맞춘다.
 */
const AlarmLinkButton = ({ color }: { color?: string }) => {
  const hasNewAlarm = useHasNewAlarm();

  return (
    <Link
      className="pc:m-0 pc:size-9 pc:p-0 pc:rounded-full pc:hover:bg-gray-400/20 -m-2 flex items-center justify-center p-2 duration-300"
      href={PAGE.ALARM}
      aria-label={hasNewAlarm ? '알림, 새 알림 있음' : '알림'}
    >
      <m.div
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="relative flex h-full w-full items-center justify-center rounded-full"
      >
        <Alert style={{ color }} className="pc:size-7 size-6" />
        {hasNewAlarm && (
          <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-[#EB001C]" />
        )}
      </m.div>
    </Link>
  );
};

export default AlarmLinkButton;
