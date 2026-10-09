'use client';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { Setting, TrashBin } from '@/shared/ui/common/icons';
import Link from '@/shared/ui/Link';

import { NotificationQueries } from '@/entities/notification';

import { alarmEditModeAtom } from '../model/alarmEditModeAtom';

export default function AlarmHeaderActions() {
  const { data: unreadCount } = useQuery(NotificationQueries.unreadCount());
  const { data: existsAny } = useQuery(NotificationQueries.existsAny());
  const [isEditMode, setEditMode] = useAtom(alarmEditModeAtom);

  // 알림 설정 — 알림을 보다가 "이거 그만 받고 싶다" 할 때 바로 갈 수 있게. 예전엔 마이페이지 안쪽에만 있었다.
  const settingsLink = (
    <Link
      href="/mypage/notification"
      aria-label="알림 설정"
      className="flex h-10 w-10 items-center justify-center"
    >
      <Setting />
    </Link>
  );

  if (unreadCount === undefined || existsAny === undefined || !existsAny) {
    return <div className="-my-1.5 ml-auto flex items-center">{settingsLink}</div>;
  }

  return (
    <div className="-my-1.5 ml-auto flex items-center">
      {!isEditMode && settingsLink}
      {isEditMode ? (
        <div className="h-10 w-10" />
      ) : (
        <button
          type="button"
          aria-label="알림 편집"
          onClick={() => setEditMode(true)}
          className="flex h-10 w-10 items-center justify-center"
        >
          <TrashBin />
        </button>
      )}
    </div>
  );
}
