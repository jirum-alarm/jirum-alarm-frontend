import dayjs from 'dayjs';

/**
 * `<time datetime>` 에 넣을 절대 시각(UTC ISO). 파싱 실패 시 null.
 *
 * 순간(instant)이라 타임존 해석 여지가 없어 서버·클라이언트가 같은 값을 만든다.
 * 날짜만 잘라 쓰면 KST 기준 자정 근처 딜이 하루 밀리므로 자르지 않는다.
 */
export function toIsoInstant(time: string | Date): string | null {
  if (!time) return null;

  const date = time instanceof Date ? time : new Date(time);

  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

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
