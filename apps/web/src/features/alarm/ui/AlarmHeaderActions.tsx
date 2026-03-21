'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { NotificationService } from '@/shared/api/notification/notification.service';

import { NotificationQueries } from '@/entities/notification';

export default function AlarmHeaderActions() {
  const queryClient = useQueryClient();
  const { data: unreadCount } = useQuery(NotificationQueries.unreadCount());

  const { mutate: readAll } = useMutation({
    mutationFn: () => NotificationService.readAllNotifications(),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: NotificationQueries.all() });
    },
  });

  if (!unreadCount) return null;

  return (
    <button onClick={() => readAll()} className="ml-auto text-sm text-gray-400">
      모두 읽음
    </button>
  );
}
