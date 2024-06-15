export function displayTime(createdAt: Date) {
  const milliSeconds = Date.now() - new Date(createdAt).getTime();

  const seconds = milliSeconds / 1000;
  if (seconds < 60) return `방금 전`;

  const minutes = seconds / 60;
  if (minutes < 10) return `방금 전`;
  if (minutes < 60) return `${Math.floor(minutes / 10) * 10}분 전`;

  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}시간 전`;

  const days = hours / 24;
  if (days < 7) return `${Math.floor(days)}일 전`;

  const weeks = days / 7;
  if (weeks < 5) return `${Math.floor(weeks)}주 전`;

  const months = days / 30;
  if (months < 12) return `${Math.floor(months)}달 전`;

  return '12달 전';
}
