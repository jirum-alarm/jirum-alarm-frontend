import dayjs from 'dayjs';

export function displayTime(createdAt: string | Date) {
  if (!createdAt) return '';

  const now = dayjs();
  const created = dayjs(createdAt);

  if (!created.isValid()) return '';

  const seconds = now.diff(created, 'second');
  if (seconds < 60) return '방금 전';

  const minutes = now.diff(created, 'minute');
  if (minutes < 10) return '방금 전';
  if (minutes < 60) return `${Math.floor(minutes / 10) * 10}분 전`;

  const hours = now.diff(created, 'hour');
  if (hours < 24) return `${hours}시간 전`;

  const days = now.diff(created, 'day');
  if (days < 7) return `${days}일 전`;

  const weeks = now.diff(created, 'week');
  if (weeks < 5) return `${weeks}주 전`;

  const months = now.diff(created, 'month');
  if (months < 12) return `${months}달 전`;

  return '12달 전';
}
