'use client';

import { useQuery } from '@tanstack/react-query';
import { useAtom } from 'jotai';

import { TrashBin } from '@/shared/ui/common/icons';

import { NotificationQueries } from '@/entities/notification';

import { alarmEditModeAtom } from '../model/alarmEditModeAtom';

export default function AlarmHeaderActions() {
  const { data: unreadCount } = useQuery(NotificationQueries.unreadCount());
  const { data: existsAny } = useQuery(NotificationQueries.existsAny());
  const [isEditMode, setEditMode] = useAtom(alarmEditModeAtom);

  if (unreadCount === undefined || existsAny === undefined) return null;
  if (!existsAny) return null;

  return (
    <div className="ml-auto flex items-center">
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
